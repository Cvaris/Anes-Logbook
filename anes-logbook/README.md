# Case Logbook & Diary

เว็บแอปบันทึกเคสวิสัญญี (logbook) + ไดอารี่ส่วนตัว สำหรับใช้งานส่วนตัว
สร้างด้วย Vite + React ไม่มี backend — ข้อมูลเก็บอยู่ในเบราว์เซอร์ของเครื่องที่ใช้เท่านั้น

## โครงสร้างไฟล์

```
anes-logbook/
├─ index.html
├─ package.json
├─ vite.config.js
├─ vercel.json
├─ public/
│  ├─ logo-logbook.png      ← โลโก้ฝั่ง logbook (ชุดครุย)
│  ├─ logo-diary.png        ← โลโก้ฝั่งมุมส่วนตัว (ชุดลำลอง)
│  ├─ apple-touch-icon.png  ← ไอคอนเวลา add to home screen
│  └─ favicon.png
└─ src/
   ├─ App.jsx               ← ตัวแอปทั้งหมด
   ├─ main.jsx
   └─ index.css
```

อยากเปลี่ยนโลโก้: วางไฟล์ใหม่ทับใน `public/` ใช้ชื่อเดิม (ควรเป็น PNG พื้นใส สี่เหลี่ยมจัตุรัส)

## ขึ้น GitHub

1. เข้า github.com → New repository → ตั้งชื่อ เช่น `anes-logbook` → เลือก **Private** → Create
2. ในหน้า repo กด **uploading an existing file**
3. ลากไฟล์และโฟลเดอร์ทั้งหมดในโฟลเดอร์นี้ลงไป (ยกเว้น `node_modules` ถ้ามี) → Commit changes

## ขึ้น Vercel

1. เข้า vercel.com → Add New → **Project** → Import repo ที่เพิ่งสร้าง
2. Framework Preset จะขึ้นเป็น **Vite** เอง — Build Command `npm run build`, Output Directory `dist`
3. กด **Deploy** รอ 1–2 นาที จะได้ลิงก์ `https://<ชื่อโปรเจกต์>.vercel.app`
4. เปิดลิงก์บนมือถือ → Share → Add to Home Screen จะได้ไอคอนน้องโลโก้บนหน้าจอ

จากนั้นทุกครั้งที่แก้ไฟล์ใน GitHub Vercel จะ deploy ใหม่ให้เอง

## รันบนเครื่องตัวเอง (ถ้าต้องการ)

```bash
npm install
npm run dev
```

## เรื่องข้อมูล

- ข้อมูลเก็บใน localStorage ของเบราว์เซอร์นั้นๆ ไม่ sync ข้ามเครื่อง และหายถ้าล้างข้อมูลเบราว์เซอร์
  → กด **สำรอง logbook (.json)** และ **สำรองไดอารี่ (.json)** เก็บไว้เป็นระยะ และใช้ปุ่มกู้คืนเวลาย้ายเครื่อง
- ไฟล์ Excel ที่ export มีชื่อผู้ป่วยอยู่ ควรเก็บในที่ปลอดภัยตามหลัก PDPA
- ไดอารี่ไม่ถูกรวมในไฟล์ Excel และรหัสล็อกมุมส่วนตัวเป็นการบังตาเบื้องต้น ไม่ใช่การเข้ารหัส
