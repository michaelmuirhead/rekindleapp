const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

// Listen for changes to the ministry/data document and send push notifications
exports.sendNotifications = onDocumentWritten("ministry/data", async (event) => {
  const before = event.data.before?.data();
  const after = event.data.after?.data();

  if (!before || !after) return;

  // Get all registered FCM tokens
  const tokensSnap = await db.collection("fcmTokens").get();
  if (tokensSnap.empty) return;

  const notifications = [];

  // --- New chat message ---
  const oldChat = before.chat || [];
  const newChat = after.chat || [];
  if (newChat.length > oldChat.length) {
    const added = newChat.slice(oldChat.length);
    for (const msg of added) {
      notifications.push({
        title: `ReKindle Chat — #${msg.channel || "general"}`,
        body: `${msg.sender || "Staff"}: ${msg.text}`,
        excludeUid: msg.uid, // don't notify the sender
      });
    }
  }

  // --- New event ---
  const oldEvents = before.events || [];
  const newEvents = after.events || [];
  if (newEvents.length > oldEvents.length) {
    const added = newEvents.slice(oldEvents.length);
    for (const ev of added) {
      notifications.push({
        title: "ReKindle — New Event",
        body: `${ev.title || "New event"} on ${ev.date || ""}`,
        excludeUid: null,
      });
    }
  }

  // --- New staff member (someone joined) ---
  const oldStaff = before.staff || [];
  const newStaff = after.staff || [];
  if (newStaff.length > oldStaff.length) {
    const added = newStaff.slice(oldStaff.length);
    for (const st of added) {
      notifications.push({
        title: "ReKindle — New User Joined!",
        body: `${st.name || st.email || "Someone"} just created an account`,
        excludeUid: st.uid, // don't notify the person who just joined
      });
    }
  }

  // --- New note ---
  const oldNotes = before.quickNotes || [];
  const newNotes = after.quickNotes || [];
  if (newNotes.length > oldNotes.length) {
    const added = newNotes.slice(oldNotes.length);
    for (const n of added) {
      notifications.push({
        title: "ReKindle — New Note",
        body: n.text || "A new note was added",
        excludeUid: null,
      });
    }
  }

  // --- Event assignment changes (teacher/preacher set) ---
  for (const newEv of newEvents) {
    const oldEv = oldEvents.find((e) => e.id === newEv.id);
    if (!oldEv) continue;

    // Teacher assigned
    if (newEv.teacher && newEv.teacher !== oldEv.teacher) {
      const assignedStaff = newStaff.find((s) => s.name === newEv.teacher);
      notifications.push({
        title: "ReKindle — You're assigned to teach!",
        body: `${newEv.title} on ${newEv.date || ""}`,
        onlyUid: assignedStaff?.uid || null,
      });
    }

    // Preacher assigned
    if (newEv.preacher && newEv.preacher !== oldEv.preacher) {
      const assignedStaff = newStaff.find((s) => s.name === newEv.preacher);
      notifications.push({
        title: "ReKindle — You're assigned to preach!",
        body: `${newEv.title} on ${newEv.date || ""}`,
        onlyUid: assignedStaff?.uid || null,
      });
    }
  }

  // --- New message (Messages page) ---
  const oldMsgs = before.messages || [];
  const newMsgs = after.messages || [];
  if (newMsgs.length > oldMsgs.length) {
    const added = newMsgs.slice(oldMsgs.length);
    for (const m of added) {
      notifications.push({
        title: "ReKindle — New Message",
        body: `${m.from || "Someone"}: ${m.subject || m.text || ""}`.slice(0, 100),
        excludeUid: null,
      });
    }
  }

  if (notifications.length === 0) return;

  // Build token map: { uid: [tokens] }
  const tokenMap = {};
  tokensSnap.forEach((doc) => {
    const data = doc.data();
    if (data.token && data.uid) {
      if (!tokenMap[data.uid]) tokenMap[data.uid] = [];
      tokenMap[data.uid].push({ token: data.token, docId: doc.id });
    }
  });

  const allTokenEntries = tokensSnap.docs.map((doc) => ({
    ...doc.data(),
    docId: doc.id,
  }));

  const staleTokens = [];

  for (const notif of notifications) {
    // Determine which tokens to send to
    let targets;
    if (notif.onlyUid) {
      // Send only to a specific user
      targets = allTokenEntries.filter((t) => t.uid === notif.onlyUid);
    } else if (notif.excludeUid) {
      // Send to everyone except the sender
      targets = allTokenEntries.filter((t) => t.uid !== notif.excludeUid);
    } else {
      targets = allTokenEntries;
    }

    if (targets.length === 0) continue;

    // Send to each token individually for better error handling
    for (const target of targets) {
      try {
        await getMessaging().send({
          token: target.token,
          notification: {
            title: notif.title,
            body: notif.body,
          },
          webpush: {
            notification: {
              icon: "/icon-192.png",
              badge: "/icon-192.png",
            },
          },
        });
      } catch (err) {
        // Token is invalid/expired — mark for cleanup
        if (
          err.code === "messaging/invalid-registration-token" ||
          err.code === "messaging/registration-token-not-registered"
        ) {
          staleTokens.push(target.docId);
        }
      }
    }
  }

  // Clean up stale tokens
  const batch = db.batch();
  for (const docId of [...new Set(staleTokens)]) {
    batch.delete(db.collection("fcmTokens").doc(docId));
  }
  if (staleTokens.length > 0) {
    await batch.commit();
  }
});
