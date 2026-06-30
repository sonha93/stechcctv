
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function rewardBirthday() {

    const today = new Date();

    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const members = await db.collection("members").get();
        console.log("Tổng members:", members.size);

members.docs.forEach(d => {
  console.log("ID:", d.id);
});
    let count = 0;

    for (const doc of members.docs) {

        const member = doc.data();
        console.log(member.phone, member.birthday);
        if (!member.birthday) continue;

       const [birthYear, birthMonth, birthDay] =
    member.birthday.split("-").map(Number);
    console.log(
  "Today:", day, month,
  "Birthday:", birthDay, birthMonth
);
        if (birthDay !== day || birthMonth !== month)
            continue;

        if (member.birthdayGiftYear === year)
            continue;

        const newPoint = Number(member.points || 0) + 100;

        await doc.ref.update({

            points: newPoint,

            birthdayGiftYear: year

        });

        // tìm user theo phone

        const userSnap = await db.collection("users")
            .where("phone","==",member.phone)
            .limit(1)
            .get();

        if(!userSnap.empty){

            const user = userSnap.docs[0];

            await db.collection("notifications").add({

                userId:user.id,

                title:"🎂 Chúc mừng sinh nhật",

                message:"Bạn đã nhận 10.000đ điểm thưởng sinh nhật.",

                read:false,

                createdAt:admin.firestore.FieldValue.serverTimestamp()

            });

        }

        console.log("Đã tặng:",member.phone);

        count++;

    }

    console.log("Hoàn tất. Tổng:",count);

}

rewardBirthday();
