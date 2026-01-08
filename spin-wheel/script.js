// ✅ Google Sheets Web App URL
const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbxf7CSMU3baSCkIjxBOKJb7vDS77S0rCNnvnQOPRkjukFslGtjYymxDAJq2OttvuQLG/exec";

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTS ================= */
    const canvas = document.getElementById("wheel");
    const ctx = canvas.getContext("2d");
    const rotator = document.getElementById("wheel-rotator");

    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const spinBtn = document.getElementById("spinBtn");
    const spinInfo = document.getElementById("spinInfo");

    const overlay = document.getElementById("overlay");
    const popupOffer = document.getElementById("popup-offer");
    const popupCoupon = document.getElementById("popup-coupon");
    const closePopup = document.getElementById("closePopup");

    /* ================= WHEEL DATA ================= */
    const labels = [
        "30% OFF",
        "15% OFF",
        "Try Next Time",
        "40% OFF",
        "25% OFF",
        "50% OFF"
    ];

    const colors = [
        "#000000",
        "#14c6cc",
        "#ff006f",
        "#14c6cc",
        "#ff006f",
        "#ffc107"
    ];

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2;
    const sliceRad = (2 * Math.PI) / labels.length;
    const sliceAngle = 360 / labels.length;

    let rotation = 0;
    let spinsUsed = 0;

    /* ================= PHONE VALIDATION ================= */
    function sanitizePhone(value) {
        return value.replace(/\D/g, "").slice(0, 10);
    }

    /* ================= DRAW WHEEL ================= */
    function drawWheel() {
        for (let i = 0; i < labels.length; i++) {
            const start = sliceRad * i;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, start, start + sliceRad);
            ctx.fillStyle = colors[i];
            ctx.fill();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(start + sliceRad / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Arial";
            ctx.fillText(labels[i], radius - 15, 5);
            ctx.restore();
        }
    }

    drawWheel();

    /* ================= UI STATE ================= */
    function updateUI() {
        const left = 2 - spinsUsed;
        spinInfo.innerHTML = `🎯 You have <b>${left}</b> spin${left !== 1 ? "s" : ""}`;

        const isPhoneValid = /^\d{10}$/.test(phoneInput.value);

        spinBtn.disabled =
            left <= 0 ||
            !nameInput.value.trim() ||
            !isPhoneValid;
    }

    nameInput.addEventListener("input", updateUI);

    phoneInput.addEventListener("input", (e) => {
        e.target.value = sanitizePhone(e.target.value);
        updateUI();
    });

    /* ================= SPIN ACTION ================= */
    spinBtn.addEventListener("click", () => {
        if (spinsUsed >= 2) return;

        const index =
            spinsUsed === 0
                ? Math.floor(Math.random() * labels.length)
                : 5;

        const rotateDeg =
            360 * 6 + sliceAngle * index + sliceAngle / 2;

        rotation += rotateDeg;
        rotator.style.transform = `rotate(${rotation}deg)`;

        spinsUsed++;
        updateUI();

        setTimeout(() => {
            const offerText = labels[index];

            /* ❌ TRY NEXT TIME → NO POPUP */
            if (offerText === "Try Next Time") {
                alert("🍀 Better luck next time!");
                return;
            }

            /* ✅ GENERATE COUPON */
            const discount = offerText.match(/\d+/)[0]; // 25, 30, 40, 50
            const couponCode = `SONOFSWAAD${discount}`;

            /* 🎉 SHOW POPUP */
            popupOffer.innerHTML = `🎉 Congratulations! You won ${offerText}`;
            popupCoupon.innerHTML = `🎟 Coupon Code: <b>${couponCode}</b>`;
            overlay.classList.remove("hidden");

            /* 📤 SAVE DATA TO GOOGLE SHEET */
            fetch(SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    phone: phoneInput.value,
                    offer: offerText,
                    coupon: couponCode,
                    spinNumber: spinsUsed,
                    userAgent: navigator.userAgent
                })
            });

        }, 5200);
    });

    closePopup.onclick = () => {
        overlay.classList.add("hidden");
    };

    updateUI();
});
