# ✅ TodoList App

แอปพลิเคชัน To-Do List แบบ Full-Stack สำหรับจัดการงานส่วนตัว รองรับหลายผู้ใช้ พร้อม Dashboard แสดงภาพรวม

---

## 🚀 วิธีติดตั้งและรันแอป

### ความต้องการของระบบ
- Python 3.10+
- Node.js 18+
- npm

### รันด้วยคำสั่งเดียว

```bash
chmod +x start.sh
./start.sh
```

จากนั้นเปิดเบราว์เซอร์ไปที่:
- **แอป:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs

### หรือรันแยก Backend / Frontend

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📱 หน้าจอและฟีเจอร์

### 1. สมัครสมาชิก / เข้าสู่ระบบ

| หน้า | URL | รายละเอียด |
|------|-----|------------|
| เข้าสู่ระบบ | `/login` | กรอก Username + Password |
| สมัครสมาชิก | `/register` | กรอก Username, Email, Password (อย่างน้อย 6 ตัว) |

> **หมายเหตุ:** ข้อมูลงานของแต่ละ user แยกจากกันโดยสมบูรณ์

---

### 2. Dashboard (`/`)

หน้าแรกหลังเข้าสู่ระบบ แสดงภาพรวมงานทั้งหมด

```
┌─────────────┬─────────────┬──────────────┬────────────┐
│ งานทั้งหมด  │ รอดำเนินการ │ กำลังดำเนิน  │ เสร็จแล้ว  │
└─────────────┴─────────────┴──────────────┴────────────┘
┌─────────────┬─────────────┬──────────────────────────────┐
│ เกินกำหนด   │ ครบกำหนดวันนี้│    อัตราการทำสำเร็จ ██░░ 60%│
└─────────────┴─────────────┴──────────────────────────────┘
┌────────────────────┬─────────────────────────────────────┐
│  Pie Chart สถานะ   │     Bar Chart ความสำคัญ              │
├────────────────────┼─────────────────────────────────────┤
│  งานตามหมวดหมู่    │     งานล่าสุด 5 รายการ               │
└────────────────────┴─────────────────────────────────────┘
```

**ข้อมูลที่แสดง:**
- 📋 จำนวนงานแยกตามสถานะ
- 🚨 งานที่เกินกำหนดส่ง
- 📅 งานที่ครบกำหนดวันนี้
- 🎯 อัตราการทำงานสำเร็จ (% Done)
- แผนภูมิวงกลม: สัดส่วนสถานะงาน
- แผนภูมิแท่ง: จำนวนงานตามความสำคัญ
- Progress bar: งานแต่ละหมวดหมู่
- รายการงานล่าสุด 5 อันดับ

---

### 3. จัดการงาน (`/tasks`)

มุมมองแบบ **Kanban Board** 3 คอลัมน์

```
┌──────────────────┬──────────────────┬──────────────────┐
│  ⏳ รอดำเนินการ  │ 🔄 กำลังดำเนิน   │   ✅ เสร็จแล้ว    │
│                  │                  │                  │
│  [Task Card]     │  [Task Card]     │  [Task Card]     │
│  [Task Card]     │                  │  [Task Card]     │
└──────────────────┴──────────────────┴──────────────────┘
```

#### เพิ่มงานใหม่
1. คลิกปุ่ม **"+ เพิ่มงาน"** มุมขวาบน
2. กรอกข้อมูลในฟอร์ม:

| ฟิลด์ | คำอธิบาย | ตัวอย่าง |
|-------|----------|----------|
| ชื่องาน * | ชื่อที่อธิบายงาน | "ส่งรายงานประจำเดือน" |
| รายละเอียด | คำอธิบายเพิ่มเติม | "ส่งให้หัวหน้าภายใน 5 โมง" |
| สถานะ | Todo / In Progress / Done | Todo |
| ความสำคัญ | ต่ำ / ปานกลาง / สูง | สูง |
| กำหนดส่ง | วันและเวลา deadline | 25/04/2026 17:00 |
| หมวดหมู่ | เลือกจากที่มีอยู่ | 💼 Work |
| แท็ก | เลือกแท็กที่ต้องการ | #urgent #design |
| ผู้เกี่ยวข้อง | พิมพ์ชื่อแล้วกด "+ เพิ่ม" | Alice, Bob |

#### การจัดการ Task Card
เมื่อ **hover** บน card จะมีปุ่มปรากฏ:
- ⭕ **วงกลมซ้าย** — คลิกเพื่อ toggle ✅ Done / ↩️ Todo
- 📋 **Dropdown สถานะ** — เปลี่ยนสถานะได้ทันที
- ✏️ **แก้ไข** — เปิดฟอร์มแก้ไขงาน
- 🗑️ **ลบ** — ลบงาน (มีขอยืนยัน)

#### สีสัญลักษณ์กำหนดเวลา
| สี | ความหมาย |
|----|-----------|
| 🗓️ สีเทา | ยังไม่ถึงกำหนด |
| 📅 สีส้ม | ครบกำหนดวันนี้ |
| 🚨 สีแดง | เกินกำหนดแล้ว |

---

### 4. ค้นหาและกรองงาน

อยู่ด้านบนหน้า Tasks มีทั้งหมด 5 ตัวกรอง:

```
🔍 [ค้นหางาน...              ] [x]

[ทุกสถานะ ▾] [ทุกความสำคัญ ▾] [ทุกหมวดหมู่ ▾] [ทุกแท็ก ▾] [ล้างตัวกรอง ×]
```

| ตัวกรอง | รายละเอียด |
|---------|------------|
| 🔍 ค้นหา | ค้นหาจากชื่องานหรือรายละเอียด (real-time) |
| สถานะ | กรองเฉพาะ Todo / In Progress / Done |
| ความสำคัญ | กรองเฉพาะ สูง / ปานกลาง / ต่ำ |
| หมวดหมู่ | กรองเฉพาะหมวดที่เลือก |
| แท็ก | กรองงานที่มีแท็กนั้น |

> กดปุ่ม **"ล้างตัวกรอง ×"** เพื่อรีเซ็ตทั้งหมด

---

### 5. หมวดหมู่ & แท็ก (`/categories`)

#### หมวดหมู่ (Categories)
ใช้จัดกลุ่มงาน เลือกได้ตอนสร้างงาน

- **เพิ่ม:** คลิก "+ เพิ่ม" → กรอกชื่อ → เลือกไอคอน → เลือกสี → บันทึก
- **แก้ไข:** คลิกปุ่ม ✏️ บน card หมวดหมู่
- **ลบ:** คลิกปุ่ม 🗑️ (งานในหมวดจะยังอยู่ แต่ไม่มีหมวด)

**ค่าเริ่มต้น** (สร้างอัตโนมัติเมื่อสมัคร):
| ไอคอน | ชื่อ | สี |
|--------|------|----|
| 💼 | Work | น้ำเงิน |
| 🏠 | Personal | เขียว |
| 🛒 | Shopping | เหลือง |
| ❤️ | Health | แดง |

#### แท็ก (Tags)
ใช้ติดป้ายกำกับงาน เลือกได้หลายแท็กต่อ 1 งาน

- **เพิ่ม:** คลิก "+ เพิ่ม" → กรอกชื่อ → เลือกสี → เพิ่มแท็ก
- **ลบ:** คลิก × บนแท็ก

**ตัวอย่างแท็ก:** `#urgent` `#bug` `#design` `#review` `#meeting`

---

## 🏗️ โครงสร้างโปรเจกต์

```
TodoList/
├── backend/
│   ├── main.py              # FastAPI app (models + routes ทั้งหมด)
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Vite + proxy ไป backend
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           # Router + Protected routes
│       ├── index.css         # Tailwind + custom components
│       ├── api/
│       │   └── index.js      # Axios + interceptors
│       ├── context/
│       │   └── AuthContext.jsx  # JWT state management
│       ├── pages/
│       │   ├── Dashboard.jsx    # หน้าภาพรวม
│       │   ├── Tasks.jsx        # Kanban board
│       │   ├── Categories.jsx   # หมวดหมู่ & แท็ก
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       └── components/
│           ├── Navbar.jsx       # Sidebar navigation
│           ├── TaskCard.jsx     # Card แสดงงาน
│           ├── TaskModal.jsx    # Modal เพิ่ม/แก้ไขงาน
│           └── SearchFilter.jsx # ค้นหา + ตัวกรอง
│
├── start.sh                 # รัน backend + frontend พร้อมกัน
└── README.md
```

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|----------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Authentication | JWT (python-jose), bcrypt (passlib) |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| HTTP Client | Axios |
| Date | date-fns |

---

## 🔌 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/auth/register` | สมัครสมาชิก |
| POST | `/auth/login` | เข้าสู่ระบบ (ได้ JWT token) |
| GET | `/auth/me` | ข้อมูล user ปัจจุบัน |
| GET | `/tasks` | ดึงรายการงาน (รองรับ query filters) |
| POST | `/tasks` | สร้างงานใหม่ |
| PUT | `/tasks/{id}` | แก้ไขงาน |
| DELETE | `/tasks/{id}` | ลบงาน |
| GET | `/categories` | ดึงหมวดหมู่ทั้งหมด |
| POST | `/categories` | สร้างหมวดหมู่ |
| PUT | `/categories/{id}` | แก้ไขหมวดหมู่ |
| DELETE | `/categories/{id}` | ลบหมวดหมู่ |
| GET | `/tags` | ดึงแท็กทั้งหมด |
| POST | `/tags` | สร้างแท็ก |
| DELETE | `/tags/{id}` | ลบแท็ก |
| GET | `/dashboard/stats` | ข้อมูลสถิติสำหรับ Dashboard |

> ดู interactive docs ได้ที่ http://localhost:8000/docs

### Query Parameters สำหรับ GET /tasks

```
/tasks?search=ประชุม&status=todo&priority=high&category_id=1&tag_id=2
```

| Parameter | ค่าที่รับได้ |
|-----------|------------|
| `search` | ข้อความ (ค้นหาใน title + description) |
| `status` | `todo` / `in_progress` / `done` |
| `priority` | `low` / `medium` / `high` |
| `category_id` | ID ของหมวดหมู่ |
| `tag_id` | ID ของแท็ก |
| `due_before` | ISO datetime |
| `due_after` | ISO datetime |

---

## ❓ คำถามที่พบบ่อย

**Q: ลืม password ทำอย่างไร?**  
A: ระบบยังไม่มี reset password ให้สมัคร account ใหม่หรือลบไฟล์ `backend/todolist.db` เพื่อล้างข้อมูลทั้งหมด

**Q: ข้อมูลอยู่ที่ไหน?**  
A: เก็บใน SQLite file ที่ `backend/todolist.db` (สร้างอัตโนมัติตอนรัน)

**Q: จะ deploy ขึ้น server ได้ไหม?**  
A: ได้ แนะนำให้เปลี่ยน `SECRET_KEY` ใน `backend/main.py` และรัน `npm run build` สำหรับ frontend production build
