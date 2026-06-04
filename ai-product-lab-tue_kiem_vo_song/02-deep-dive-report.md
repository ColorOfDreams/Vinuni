# Lab 02 - Problem Deep-Dive Report

## Thong tin nhom

- Ten nhom: Vinahouse
- Thanh vien: Nam
- Bai toan chon deep-dive: Tro ly ca nhan hoa hanh trinh sac cho nguoi dung VinFast trong cac chuyen di dai, ket hop VinFast va mang tram V-Green.

---

## 1. Quyet dinh lua chon bai toan

Nhom chon bai toan **VinFast / V-Green Smart Charging Journey Assistant** vi day la pain point gan truc tiep voi trai nghiem xe dien: nguoi dung di xa thuong lo ve pin, thong tin tram sac thay doi theo thoi gian thuc, va quyet dinh dung sac sai co the lam mat them 10-30 phut moi chuyen. Bai toan co du du lieu de bat dau prototype theo scope hep: SOC pin, loai xe, tuyen duong, khoang cach toi tram, cong suat sac, tinh trang cong sac, lich su cho, rating va so thich dung nghi cua nguoi dung.

---

## 2. Current-State Workflow Mapping

### Quy trinh hien tai

```text
Nguoi dung lap/chay hanh trinh dai
  -> 1. Tu theo doi pin, quang duong con lai, dia hinh va toc do di chuyen
  -> 2. Khi pin xuong thap moi mo app/ban do de tim tram sac gan nhat
  -> 3. Tu so sanh tram: khoang cach, cong sac, toc do sac, tinh trang trong/ban
  -> 4. Dieu huong toi tram da chon
  -> 5. Den tram: neu day/loi/khong hop cong sac thi cho hoac doi tram
  -> 6. Trong luc cho sac, tu tim quan an, nha ve sinh, diem nghi xung quanh
  -> 7. Sac xong, tiep tuc hanh trinh va tu danh gia lai pin cho chang tiep theo
```

### Handoff va bottleneck

| Buoc | Actor / He thong | Thoi gian uoc tinh | Handoff | Van de |
|---|---|---:|---|---|
| 1 | Nguoi lai + xe | Lien tuc | Xe hien SOC/range cho nguoi lai | Nguoi dung phai tu tinh khi nao nen dung |
| 2 | Nguoi lai + app ban do | 3-7 phut | Nguoi dung chuyen tu lai xe sang tim kiem | Quyet dinh thuong xay ra muon khi pin da thap |
| 3 | Nguoi lai + app VinFast/V-Green | 5-10 phut | App cung cap du lieu, nguoi dung tu danh gia | Thieu du bao thoi gian cho va do phu hop ca nhan |
| 4 | Nguoi lai + navigation | 5-20 phut tuy do lech tuyen | Dieu huong sang tram sac | Tram gan nhat chua chac la tram it gian doan nhat |
| 5 | Nguoi lai + tram V-Green | 0-30 phut | Trang thai thuc te tai tram | Co the phai cho, doi tram, hoac sac cham |
| 6 | Nguoi lai | 5-15 phut | Tu tim tien ich dia phuong | Dung sac khong bien thanh diem nghi huu ich |

Tong thoi gian bi anh huong trong mot lan dung sac: **18-52 phut**, trong do phan lang phi do chon tram khong toi uu uoc tinh **10-30 phut**.

**Bottleneck chinh:** buoc 2-5. Quyet dinh sac dien den muon, nguoi dung phai tu tong hop qua nhieu tin hieu, trong khi trang thai tram va hang doi thay doi lien tuc.

---

## 3. Problem Statement 6-Field

| Field | Noi dung chi tiet |
|---|---|
| **1. Actor / Operator** | Nguoi dung VinFast di xa/du lich, nguoi dung moi chuyen sang xe dien, tai xe xe dien co hanh trinh dai, va doi van hanh tram sac V-Green. |
| **2. Current Workflow** | Nguoi dung tu theo doi pin va tuyen duong; khi pin thap moi tim tram sac tren app/ban do; tu danh gia tram gan, trong, sac nhanh; di chuyen toi tram; neu phai cho lau thi tu tim diem an uong/nghi ngoi. Cong cu hien tai la man hinh xe, app VinFast/V-Green, ban do dieu huong va thong tin tram realtime neu co. |
| **3. Bottleneck** | Buoc 2-4 cham va de loi nhat: nguoi dung quyet dinh sac qua muon, thieu du bao hang doi/toc do sac, va khong co xep hang tram theo muc do it gian doan voi hanh trinh ca nhan. |
| **4. Business Impact** | Trai nghiem di xa bang xe dien kem tu tin; tang Station Switch Rate; tang so lan pin xuong duoi nguong an toan; lam qua tai cuc bo mot so tram; giam niem tin vao he sinh thai VinFast/V-Green. Moi lan chon sai tram co the lam mat them 10-30 phut. |
| **5. Success Metric** | Giam Station Switch Rate tu 12% xuong <5%; giam so lan pin xuong duoi 15% trong chuyen dai 30%; Successful Recommendation Completion Rate >40% (goi y -> dieu huong -> sac thanh cong -> rating >=4); tang Useful Charging Stop Rate tu 25% len 50%. |
| **6. Operational Boundary** | AI duoc phep xep hang diem dung, giai thich ly do, canh bao rui ro pin, va de xuat plan sac dang draft. AI khong duoc dieu khien xe, khong duoc bat dau/ket thuc phien sac, khong duoc dam bao chac chan cong sac se trong, khong duoc khuyen nguoi dung tiep tuc lai khi SOC duoi nguong an toan. Khi pin <5%, he thong chi duoc de xuat tram trong ban kinh <=5 km hoac kich hoat quy trinh ho tro khan cap/mobile charging. |

---

## 4. AI Fit Matrix

| Thanh phan | Muc AI Fit | Ly do |
|---|---|---|
| Safety rules | Rule / State Machine | Can tinh quyet dinh cao: nguong pin, khoang cach toi tram, loai cong sac, han che an toan. |
| Du bao thoi gian cho/toc do sac | Predictive ML | Phu hop voi du lieu lich su theo tram, gio, ngay, cong suat, ty le loi va nhu cau. |
| Xep hang diem dung | Recommendation | Can toi uu da muc tieu: an toan pin, do lech tuyen, thoi gian cho, toc do sac, tien ich, so thich ca nhan. |
| Giai thich cho nguoi dung | LLM Feature | LLM dung de bien diem so thanh loi giai thich de hieu, khong phai lop ra quyet dinh an toan. |
| Tu dat/giu cong sac | Not Yet / No Agent | Rui ro van hanh cao, phu thuoc inventory realtime va chinh sach tram. Chua nen cho agent tu hanh dong. |

Ket luan AI Fit: **Rule + Predictive ML + Recommendation + LLM explanation**, khong dung full Agent trong scope prototype dau tien.

---

## 5. Future-State Flow

```text
1. Xe/app nhan thong tin hanh trinh: diem den, SOC, loai xe, thoi gian du kien
  -> [Rule] Kiem tra nguong an toan pin va tam voi toi cac tram phu hop
  -> [ML] Du bao thoi gian cho va toc do sac hieu dung cho tung tram
  -> [Recommendation] Cham diem tram theo:
       safety buffer, do lech tuyen, tong thoi gian dung, cong suat sac,
       tinh trang realtime, tien ich dia phuong, lich su so thich nguoi dung
  -> [LLM] Giai thich top 3 goi y bang ngon ngu tu nhien
  -> [Human Step] Nguoi dung chon "Dieu huong", "Luu de sau", hoac "Bo qua"
  -> [Fallback] Neu du lieu tram mat ket noi/khong chac chan:
       dung rule an toan, uu tien tram gan va co nhieu cong,
       hien canh bao "du lieu tram chua duoc xac thuc realtime"
```

### Vi du output nguoi dung nhin thay

```text
[DRAFT_ONLY]
Goi y dung sac sau 42 km tai Tram V-Green Ninh Binh A.
Ly do: lech tuyen 1.8 km, du kien con 24% pin khi den, 3/4 cong CCS2 dang kha dung,
thoi gian cho du bao 6 phut, gan quan an va nha ve sinh. Phuong an du phong:
Tram Ninh Binh B cach them 9 km, nhieu cong hon nhung lech tuyen 4.5 km.
```

---

## 6. Operational Boundary & Fallback

### AI duoc phep lam

- Tinh diem rui ro pin va canh bao som.
- Goi y thoi diem dung sac va 1-3 tram phu hop.
- Giai thich trade-off: tram gan hon, tram nhanh hon, tram co tien ich tot hon.
- Hoc so thich nguoi dung tu rating sau khi sac, vi du thich tram gan quan an hay tram it lech tuyen.

### AI khong duoc lam

- Khong dieu khien xe hoac yeu cau nguoi dung lai tiep khi pin qua thap.
- Khong tu dong khoi dong/thanh toan/ket thuc phien sac.
- Khong noi chac chan "tram se trong" neu chi co du bao.
- Khong de xuat tram xa hon 5 km khi SOC <5% neu chua co phuong an cuu ho.
- Khong che giau muc do bat dinh cua du lieu realtime.

### Fallback

| Tinh huong loi | Fallback |
|---|---|
| Mat du lieu realtime tram | Dung snapshot gan nhat + rule an toan, uu tien tram gan/co nhieu cong, hien canh bao du lieu cu. |
| Model ML confidence thap | Chuyen sang xep hang rule-based theo khoang cach, so cong, cong suat va safety buffer. |
| SOC <5% | Chi de xuat tram <=5 km neu co; neu khong, tra ve action `dispatch_mobile_charger`. |
| LLM sinh noi dung vuot ranh gioi | Chan output, tra ve template giai thich an toan da dinh san. |
| Nguoi dung bo qua goi y | Luu su kien, tiep tuc theo doi pin, canh bao lai khi qua nguong rui ro tiep theo. |

---

## 7. Technical Prototype Scope

### Input toi thieu

```json
{
  "vehicle_model": "VF8",
  "battery_soc": 28,
  "current_location": "Cao toc Ha Noi - Ninh Binh",
  "destination": "Thanh Hoa",
  "route_remaining_km": 126,
  "charging_port": "CCS2",
  "user_preferences": ["it_lech_tuyen", "co_quan_an", "sac_nhanh"]
}
```

### Output toi thieu

```json
{
  "status": "draft_recommendation",
  "safety_level": "normal|warning|critical",
  "top_recommendations": [
    {
      "station_id": "VGREEN_NB_A",
      "reason": "It lech tuyen, du kien con 24% pin khi den, thoi gian cho thap.",
      "estimated_wait_min": 6,
      "detour_km": 1.8,
      "confidence": 0.78
    }
  ],
  "fallback": "Neu du lieu tram thay doi, uu tien tram gan nhat co cong CCS2."
}
```

---

## 8. AI Readiness Checklist

1. [x] Chung toi co san du lieu mau/logs de test: log SOC, route, tram, thoi gian cho, phien sac, rating sau sac co the thu thap tu VinFast/V-Green.
2. [x] Rui ro khi AI sai nam trong tam kiem soat: rule an toan nam truoc ML/LLM, nguoi dung phai bam xac nhan dieu huong, co fallback khi SOC thap.
3. [ ] Stakeholders san sang thay doi quy trinh cu: can pilot voi mot nhom nguoi dung di xa truoc khi roll-out rong.

---

## 9. Quyet dinh cuoi cung

[x] **GO (Bat dau xay dung Prototype)** voi scope hep trong app/xe: goi y diem dung sac dang draft, chua tu dong dat cong sac hay thuc hien hanh dong tai tram.

[ ] **NOT YET**

[ ] **NO-GO**

### Justification

Nen GO vi bai toan co tac dong trai nghiem ro rang, metric do duoc, va rui ro co the khoa bang rule-based safety layer. Prototype dau tien khong can agent phuc tap: chi can pipeline gom rule an toan, model du bao don gian, recommender va LLM giai thich. Phan LLM khong ra quyet dinh an toan nen rui ro hallucination duoc giam. Chi phi prototype hop ly vi co the bat dau bang du lieu gia lap/log noi bo, test offline voi route pho bien Ha Noi - Ninh Binh - Thanh Hoa, sau do pilot voi nguoi dung that.

Dieu kien truoc khi scale: can xac lap baseline Station Switch Rate, ty le SOC <15%, do tre realtime cua du lieu tram, va co co che thu thap rating sau moi lan dung sac.
