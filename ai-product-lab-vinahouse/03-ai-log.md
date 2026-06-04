# AI Log & Reflection

Trong buoi lab nay, toi dung AI nhu mot thought-partner de bien mot y tuong kha rong: "tro ly sac dien cho xe VinFast" thanh mot bai toan san pham co ranh gioi van hanh ro rang. AI giup toi tach bai toan thanh cac lop: rule an toan pin, du bao thoi gian cho, recommender xep hang tram sac, va LLM chi giai thich cho nguoi dung.

Diem huu ich nhat la AI giup stress-test metric. Ban dau toi chi nghi den "giam thoi gian tim tram", nhung sau khi trao doi toi bo sung them cac metric do duoc hon: Station Switch Rate, so lan pin xuong duoi 15%, Successful Recommendation Completion Rate va Useful Charging Stop Rate. Cac metric nay gan hon voi trai nghiem that va de dung de quyet dinh GO/NO-GO.

AI cung co diem sai: co luc no de xuat dung agent tu dong dat truoc cong sac hoac dieu phoi hanh dong tai tram. Huong nay nghe hay nhung vuot scope va co rui ro van hanh, vi trang thai cong sac thay doi lien tuc va lien quan den chinh sach cua V-Green. Toi sua lai bang cach quy dinh LLM chi duoc tao khuyen nghi dang draft, nguoi dung phai bam xac nhan, va he thong khong duoc tu dong khoi dong/thanh toan/ket thuc phien sac.

Toi cung bo sung ranh gioi an toan cho prompt prototype: output phai co tag `[DRAFT_ONLY]`, pin <5% thi khong duoc de xuat tram xa hon 5 km, va neu khong co tram gan thi phai tra ve action `dispatch_mobile_charger`. Cach lam nay giup AI tro thanh lop giai thich va ho tro quyet dinh, khong phai nguon quyet dinh an toan cuoi cung.

Neu lam tiep, toi se can du lieu that hon ve thoi gian cho tai tung tram theo gio, ty le loi cong sac, va hanh vi rating cua nguoi dung sau khi sac. Khi co du lieu do, prototype co the chuyen tu rule/recommender gia lap sang ML ranking nghiem tuc hon.
