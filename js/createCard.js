/**
 * Tạo một đối tượng thẻ bài trong trò chơi
 */
export const createCard = ({
    scene,        // Cảnh hiện tại trong trò chơi, nơi thẻ bài sẽ được thêm
    x,            // Tọa độ X để đặt thẻ bài
    y,            // Tọa độ Y để đặt thẻ bài
    frontTexture, // Tên ảnh mặt trước của thẻ bài
    cardName      // Tên định danh của thẻ bài (dùng để nhận diện)
}) => {

    let isFlipping = false; // Biến kiểm soát trạng thái lật thẻ (đang lật hay không)
    const rotation = { y: 0 }; // Giá trị góc quay Y của thẻ bài (ban đầu là 0)

    const backTexture = "card-back"; // Kết cấu (texture) mặc định của mặt sau thẻ bài

    // Tạo một đối tượng thẻ bài trong cảnh
    const card = scene.add.plane(x, y, backTexture) 
        .setName(cardName)   // Đặt tên cho thẻ bài
        .setInteractive();   // Kích hoạt chế độ tương tác (cho phép người chơi nhấp vào thẻ)

    // Khởi tạo trạng thái thẻ bài úp xuống
    card.modelRotationY = 180;

    // Biến để theo dõi trạng thái lật và đối chiếu thẻ
    let matched = false;

    // Hàm lật thẻ bài
    const flipCard = (callbackComplete) => {
        if (isFlipping || matched) {
            return; // Nếu thẻ bài đang lật hoặc đã ghép đôi, không thực hiện gì thêm
        }

        // Thêm hiệu ứng lật thẻ
        scene.add.tween({
            targets: [rotation], // Đối tượng bị ảnh hưởng (trong trường hợp này là rotation.y)
            y: (rotation.y === 180) ? 0 : 180, // Nếu đang úp (180) thì lật lên (0), ngược lại
            ease: Phaser.Math.Easing.Expo.Out, // Hiệu ứng hoạt hình mượt mà
            duration: 500, // Thời gian thực hiện hoạt hình (500ms)
            onStart: () => {
                isFlipping = true; // Đặt trạng thái đang lật thẻ
                scene.sound.play("card-flip"); // Phát âm thanh lật thẻ

                // Tạo hiệu ứng "zoom-in" và "zoom-out" khi lật
                scene.tweens.chain({
                    targets: card,
                    ease: Phaser.Math.Easing.Expo.InOut, // Hiệu ứng co giãn
                    tweens: [
                        {
                            duration: 200, // Thời gian phóng to
                            scale: 1.1,    // Tăng kích thước
                        },
                        {
                            duration: 300, // Thời gian thu nhỏ lại
                            scale: 1       // Kích thước ban đầu
                        },
                    ]
                });
            },
            onUpdate: () => {
                // Cập nhật góc quay thẻ bài
                card.rotateY = 180 + rotation.y;
                const cardRotation = Math.floor(card.rotateY) % 360; // Lấy góc quay trong khoảng 0-359

                // Nếu góc quay là mặt trước hoặc mặt sau, thay đổi kết cấu (texture)
                if ((cardRotation >= 0 && cardRotation <= 90) || (cardRotation >= 270 && cardRotation <= 359)) {
                    card.setTexture(frontTexture); // Đặt ảnh mặt trước
                } else {
                    card.setTexture(backTexture); // Đặt ảnh mặt sau
                }
            },
            onComplete: () => {
                isFlipping = false; // Đặt trạng thái lật thẻ về false
                if (callbackComplete) {
                    callbackComplete(); // Gọi callback khi hoạt hình hoàn tất
                }
            }
        });
    };

    // Hàm kiểm tra nếu thẻ được ghép cặp thành công
    const checkMatch = (otherCard) => {
        if (matched || otherCard.matched) {
            return false;
        }

        if (cardName === otherCard.cardName) {
            matched = true;
            otherCard.matched = true;

            // Hiệu ứng khi ghép đúng
            scene.sound.play("card-match");

            // // Hiệu ứng +10 điểm
            // const coinText = scene.add.text(card.x, card.y - 50, "+10", {
            //     font: "24px Arial",
            //     fill: "#FFD700"
            // }).setOrigin(0.5);

            scene.add.tween({
                targets: coinText,
                y: coinText.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => coinText.destroy()
            });

            return true; // Trả về trạng thái ghép đúng
        } else {
            // Phát âm thanh không khớp
            scene.sound.play("card-mismatch");
            return false; // Trả về trạng thái không khớp
        }
    };

    // Hàm hủy thẻ bài (thêm hiệu ứng bay lên trước khi xóa)
    const destroy = () => {
        scene.add.tween({
            targets: [card],
            y: card.y - 1000, // Di chuyển thẻ lên trên màn hình
            easing: Phaser.Math.Easing.Elastic.In, // Hiệu ứng co giãn
            duration: 500, // Thời gian thực hiện hoạt hình
            onComplete: () => {
                card.destroy(); // Xóa thẻ bài khỏi cảnh
            }
        });
    };

    // Trả về một đối tượng thẻ bài với các phương thức:
    return {
        gameObject: card, // Đối tượng Phaser đại diện cho thẻ bài
        flip: flipCard,   // Hàm lật thẻ bài
        destroy,          // Hàm hủy thẻ bài
        cardName,         // Tên của thẻ bài
        checkMatch,       // Hàm kiểm tra ghép cặp
        matched           // Trạng thái ghép cặp
    };
};

