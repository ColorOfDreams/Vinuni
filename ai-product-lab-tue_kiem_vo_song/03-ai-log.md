# Nhật ký AI & Reflection

Trong buổi lab này, tôi dùng AI như một thought-partner để biến một ý tưởng khá rộng: "trợ lý sạc điện cho xe VinFast" thành một bài toán sản phẩm có ranh giới vận hành rõ ràng. AI giúp tôi tách bài toán thành các lớp: rule an toàn pin, dự báo thời gian chờ, recommender xếp hạng trạm sạc, và LLM chỉ giải thích cho người dùng.

Điểm hữu ích nhất là AI giúp stress-test metric. Ban đầu tôi chỉ nghĩ đến "giảm thời gian tìm trạm", nhưng sau khi trao đổi, tôi bổ sung thêm các metric đo được hơn: Station Switch Rate, số lần pin xuống dưới 15%, Successful Recommendation Completion Rate và Useful Charging Stop Rate. Các metric này gắn hơn với trải nghiệm thật và dễ dùng để quyết định GO/NO-GO.

AI cũng có điểm sai: có lúc nó đề xuất dùng agent tự động đặt trước cổng sạc hoặc điều phối hành động tại trạm. Hướng này nghe hay nhưng vượt scope và có rủi ro vận hành, vì trạng thái cổng sạc thay đổi liên tục và liên quan đến chính sách của V-Green. Tôi sửa lại bằng cách quy định LLM chỉ được tạo khuyến nghị dạng draft, người dùng phải bấm xác nhận, và hệ thống không được tự động khởi động/thanh toán/kết thúc phiên sạc.

Tôi cũng bổ sung ranh giới an toàn cho prompt prototype: output phải có tag `[DRAFT_ONLY]`, pin <5% thì không được đề xuất trạm xa hơn 5 km, và nếu không có trạm gần thì phải trả về action `dispatch_mobile_charger`. Cách làm này giúp AI trở thành lớp giải thích và hỗ trợ quyết định, không phải nguồn quyết định an toàn cuối cùng.

Nếu làm tiếp, tôi sẽ cần dữ liệu thật hơn về thời gian chờ tại từng trạm theo giờ, tỷ lệ lỗi cổng sạc, và hành vi rating của người dùng sau khi sạc. Khi có dữ liệu đó, prototype có thể chuyển từ rule/recommender giả lập sang ML ranking nghiêm túc hơn.
