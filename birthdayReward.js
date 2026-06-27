// birthdayReward.js

async function checkBirthdayReward(phone) {

    if (!phone) return false;

    try {

        const memberSnap = await firebase.firestore()
            .collection("members")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        if (memberSnap.empty) return false;

        const memberDoc = memberSnap.docs[0];
        const memberRef = memberDoc.ref;
        const member = memberDoc.data();

        if (!member.birthday) return false;

        const today = new Date();
const currentYear = today.getFullYear();

const [year, month, day] = member.birthday.split("-").map(Number);

const isBirthday =
    today.getDate() === day &&
    today.getMonth() + 1 === month;
        const receivedThisYear =
            member.birthdayGiftYear === currentYear;

        if (!isBirthday || receivedThisYear) {
            return false;
        }

        // cộng 100 điểm
        const newPoints =
            Number(member.points || 0) + 100;

        await memberRef.update({

            points: newPoints,

            birthdayGiftYear: currentYear

        });

        // lưu thông báo
        const userSnap = await firebase.firestore()
            .collection("users")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        if (!userSnap.empty) {

            await firebase.firestore()
                .collection("notifications")
                .add({

                    userId: userSnap.docs[0].id,

                    title: "🎂 Quà sinh nhật",

                    message:
                        "Chúc mừng sinh nhật! Bạn đã nhận 100 điểm (10.000đ).",

                    read: false,

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

        }

        return {

            rewarded: true,

            points: newPoints

        };

    } catch (err) {

        console.error("Birthday Reward Error:", err);

        return false;

    }

}
