import { createCard } from "./createCard.js";

/**
 * Trò chơi Memory Card của Francisco Pereira (Gammafp)
 * -----------------------------------------------------
 *
 * Kiểm tra kỹ năng ghi nhớ của bạn trong trò chơi cổ điển ghép cặp này.
 * Lật các thẻ để xem hình ảnh, cố gắng nhớ vị trí của từng hình.
 * Ghép tất cả các cặp để chiến thắng!
 *
 * Ghi chú nhạc:
 * "Fat Caps" của Audionautix được cấp phép theo giấy phép Creative Commons Attribution 4.0. https://creativecommons.org/licenses/by/4.0/
 * Nghệ sĩ http://audionautix.com/
 */
export class Play extends Phaser.Scene {
    // Tên của tất cả các thẻ
    cardNames = ["card-0", "card-1", "card-2", "card-3", "card-4", "card-5"];
    // Đối tượng Game của các thẻ
    cards = [];

    // Lịch sử thẻ đã mở
    cardOpened = undefined;

    // Có thể chơi trò chơi
    canMove = false;

    // Biến trò chơi
    lives = 0; 
    // coin = 0; // Số lượng xu
    
    // Cấu hình lưới
    gridConfiguration = {
        x: 115,       // Tọa độ X bắt đầu
        y: 242,       // Tọa độ Y bắt đầu
        paddingX: 10, // Khoảng cách ngang giữa các thẻ
        paddingY: 10  // Khoảng cách dọc giữa các thẻ
    };

    constructor() {
        super({
            key: 'Play' // Khóa nhận diện cảnh
        });
        this.items =[
            {
                coin: 10
            }
        ] ; // Initialize coin for the game
        this.solBalance = 0;
    }

    init() {
        // Làm mờ camera khi vào cảnh
        this.cameras.main.fadeIn(500);
        this.lives = 5; // Số mạng ban đầu
        this.volumeButton(); // Tạo nút âm lượng
    }

    create() {
        // Hình nền
        // this.add.image(this.gridConfiguration.x - 63, this.gridConfiguration.y + 60, "background").setOrigin(0);
        
        const titleText = this.add.text(
            this.sys.game.scale.width / 2,
            this.sys.game.scale.height / 2,
            "Memory Card Game\nClick to Play", // Tiêu đề trò chơi
            {
                align: "center",
                strokeThickness: 4, // Độ dày viền chữ
                fontSize: 40,
                fontStyle: "bold",
                color: "#8c7ae6" // Màu chữ
            }
        )
            .setOrigin(0.5) // Tâm của văn bản
            .setDepth(3) // Lớp sâu (hiển thị phía trên)
            .setInteractive(); // Kích hoạt tương tác
        // Hiệu ứng nhấp nháy chữ
        this.add.tween({
            targets: titleText,
            duration: 800, // Thời gian 800ms
            ease: (value) => (value > 0.8), // Hàm chuyển đổi mượt
            alpha: 0, // Độ trong suốt
            repeat: -1, // Lặp vô hạn
            yoyo: true // Lặp lại đảo ngược
        });

        // Sự kiện văn bản
        titleText.on(Phaser.Input.Events.POINTER_OVER, () => {
            titleText.setColor("#9c88ff"); // Thay đổi màu khi di chuột
            this.input.setDefaultCursor("pointer"); // Con trỏ hình bàn tay
        });
        titleText.on(Phaser.Input.Events.POINTER_OUT, () => {
            titleText.setColor("#8c7ae6"); // Trả lại màu ban đầu
            this.input.setDefaultCursor("default"); // Con trỏ mặc định
        });
        titleText.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.sound.play("whoosh", { volume: 1.3 }); // Âm thanh khi nhấn
            this.add.tween({
                targets: titleText,
                ease: Phaser.Math.Easing.Bounce.InOut, // Hiệu ứng bật
                y: -1000, // Di chuyển văn bản ra ngoài màn hình
                onComplete: () => {
                    if (!this.sound.get("theme-song")) {
                        this.sound.play("theme-song", { loop: true, volume: 0.5 }); // Nhạc nền
                    }
                    this.startGame(); // Bắt đầu trò chơi
                }
            });
        });
    }

    restartGame() {
        // Khởi động lại trò chơi
        this.cardOpened = undefined; // Xóa lịch sử thẻ mở
        this.cameras.main.fadeOut(200 * this.cards.length); // Làm mờ camera dần
        this.cards.reverse().map((card, index) => {
            this.add.tween({
                targets: card.gameObject,
                duration: 500, // Thời gian 500ms
                y: 1000, // Thẻ trượt xuống dưới màn hình
                delay: index * 100, // Trễ dựa trên thứ tự
                onComplete: () => {
                    card.gameObject.destroy(); // Hủy đối tượng thẻ
                }
            });
        });

        this.time.addEvent({
            delay: 200 * this.cards.length, // Đợi hoàn tất
            callback: () => {
                this.cards = []; // Làm trống danh sách thẻ
                this.canMove = false; // Tạm dừng di chuyển
                this.scene.restart(); // Khởi động lại cảnh
                this.sound.play("card-slide", { volume: 1.2 }); // Âm thanh chuyển thẻ
            }
        });
    }

    createGridCards() {
        // Lấy danh sách tên các thẻ, trộn ngẫu nhiên
        const gridCardNames = Phaser.Utils.Array.Shuffle([...this.cardNames, ...this.cardNames]);
    
        // Trả về một mảng các thẻ đã được tạo và hoạt ảnh
        return gridCardNames.map((name, index) => {
            // Tạo thẻ mới
            const newCard = createCard({
                scene: this, // Cảnh hiện tại
                // Vị trí thẻ bài với khoảng cách giữa các thẻ
                x: this.gridConfiguration.x + (98 + this.gridConfiguration.paddingX) * (index % 4),
                y: -2000, // Vị trí ban đầu của thẻ là ngoài màn hình
                frontTexture: name, // Hình ảnh mặt trước của thẻ
                cardName: name // Tên của thẻ (để nhận diện khi so khớp)
                
            });
            
            // Tạo hoạt ảnh cho thẻ khi nó xuất hiện trên màn hình
            this.add.tween({
                targets: newCard.gameObject, // Đối tượng thẻ
                duration: 800, // Thời gian của hoạt ảnh (800ms)
                delay: index * 100, // Thời gian trì hoãn theo thứ tự thả thẻ (mỗi thẻ một chút)
                onStart: () => this.sound.play("card-slide", { volume: 1.2 }), // Phát âm thanh khi thẻ xuất hiện
                y: this.gridConfiguration.y  + (128 + this.gridConfiguration.paddingY) * Math.floor(index / 4) // Vị trí Y của thẻ sau khi xuất hiện
            });
    
            // Trả về thẻ mới tạo
            return newCard;
        });
    }
    

    createHearts() {
        // Tạo một mảng các hình trái tim, mỗi trái tim đại diện cho một mạng sống
        return Array.from(new Array(this.lives)).map((el, index) => {
            // Tạo một hình trái tim, ban đầu nằm ngoài màn hình (tọa độ X: `this.sys.game.scale.width + 1000`)
            const heart = this.add.image(this.sys.game.scale.width + 1000, 150, "heart")
                .setScale(2.5); // Phóng to trái tim gấp 2 lần kích thước gốc
    
            // Thêm hoạt ảnh di chuyển trái tim từ ngoài màn hình vào vị trí hiển thị
            this.add.tween({
                targets: heart, // Đối tượng được áp dụng hoạt ảnh
                ease: Phaser.Math.Easing.Expo.InOut, // Dùng easing để tạo hiệu ứng mượt mà (Expo: tăng tốc nhanh, giảm tốc dần)
                duration: 1000, // Thời gian hoàn thành mỗi hoạt ảnh (1 giây)
                delay: 1000 + index * 200, // Thời gian trì hoãn trước khi bắt đầu hoạt ảnh
                                          // (trái tim đầu tiên xuất hiện sau 1 giây, trái tim tiếp theo trễ thêm 0.2 giây)
                x: 130 + 40 * index // Vị trí X cuối cùng của trái tim
                                    // Mỗi trái tim được cách nhau một khoảng cố định (30px)
            });
    
            // Trả về đối tượng trái tim vừa tạo
            return heart;
        });
    }
    


    volumeButton ()
    {
        const volumeIcon = this.add.image(25, 25, "volume-icon").setName("volume-icon");
        volumeIcon.setInteractive();
        volumeIcon.setTint(0x00D7FF);

        // Mouse enter
        volumeIcon.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.input.setDefaultCursor("pointer");
            volumeIcon.setTint(0x00D7FF);
        });
        // Mouse leave
        volumeIcon.on(Phaser.Input.Events.POINTER_OUT, () => {
            console.log("Mouse leave");
            this.input.setDefaultCursor("default");
            volumeIcon.setTint(0x00D7FF);
            // volumeIcon.clearTint(); // Xóa hiệu ứng màu
        });


        volumeIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.sound.volume === 0) {
                this.sound.setVolume(1);
                volumeIcon.setTexture("volume-icon");
                volumeIcon.setAlpha(1);
            } else {
                this.sound.setVolume(0);
                volumeIcon.setTexture("volume-icon_off");
                volumeIcon.setAlpha(.5)
            }
        });
    }

    
    startGame ()
    {
        // Nút kết nối Phantom
        const connectButton = this.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height - 130, 'Connect Phantom', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#fff',
            backgroundColor: '#0077ff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        connectButton.on('pointerdown', async () => {
            const walletAddress = await connectPhantom();
            if (walletAddress) {
                // Cập nhật giao diện sau khi kết nối thành công
                this.displaySolBalance(walletAddress);
            }
        });
         // Lấy giá trị coin từ mảng items
         this.coin = this.items[0].coin;
        //background bao quanh thẻ bài
        this.add.image(this.gridConfiguration.x - 63, this.gridConfiguration.y - 77, "background").setOrigin(0);
        
        //Hiển thị số coin trong item
        const coinText = this.add.text(this.sys.game.scale.width / 2, 60, `Coins: ${this.coin}`, {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#000',                                                                                            
            strokeThickness: 4
        }).setOrigin(0.5, 0);
        

        // Mua dùng điểm đổi trái tim()
        const buyHeartButton = this.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height - 80, 'Buy Heart (10 Coins)', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#000',
            backgroundColor: '#FFD700',
            border: 30,
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5)
        .setInteractive();

        buyHeartButton.on('pointerdown', () => {
            if (this.coin >= 10) {
                // Giảm số coin khi mua trái tim
                this.coin -= 10;
                coinText.setText(`Coins: ${this.coin}`);

                // Thêm một trái tim mới
                const newHeart = this.add.image(this.sys.game.scale.width + 1000, 150, "heart").setScale(2.5);
                this.add.tween({
                    targets: newHeart,
                    ease: Phaser.Math.Easing.Expo.InOut,
                    duration: 1000,
                    delay: 1000,
                    x: 130 + 40 * hearts.length,
                });

                hearts.push(newHeart);
            } else {
                // Hiển thị thông báo lỗi khi không đủ coin
                alert('Bạn không đủ tiền để mua trái tim!');
            }
        });

        
        
        // WinnerText and GameOverText
        const winnerText = this.add.text(this.sys.game.scale.width / 2, -1000, "YOU WIN",
            { align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#8c7ae6" }
        ).setOrigin(.5)
            .setDepth(3)
            .setInteractive();

        const gameOverText = this.add.text(this.sys.game.scale.width / 2, -1000,
            "GAME OVER\nClick to restart",
            { align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#ff0000" }
        )
            .setName("gameOverText")
            .setDepth(3)
            .setOrigin(.5)
            .setInteractive();

        // Start lifes images
        const hearts = this.createHearts();

        // Create a grid of cards
        this.cards = this.createGridCards();

        // Start canMove
        this.time.addEvent({
            delay: 200 * this.cards.length,
            callback: () => {
                this.canMove = true;
            }
        });
        
        // Game Logic
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            if (this.canMove) {
                const card = this.cards.find(card => card.gameObject.hasFaceAt(pointer.x, pointer.y));
                if (card) {
                    this.input.setDefaultCursor("pointer");
                } else {
                    if(go[0]) {
                        if(go[0].name !== "volume-icon") {
                            this.input.setDefaultCursor("pointer");
                        }
                    } else {
                        this.input.setDefaultCursor("default");
                    }
                }
            }
        });
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => {
            if (this.canMove && this.cards.length) {
                const card = this.cards.find(card => card.gameObject.hasFaceAt(pointer.x, pointer.y));

                if (card) {
                    this.canMove = false;

                    // Detect if there is a card opened
                    if (this.cardOpened !== undefined) {
                        // If the card is the same that the opened not do anything
                        if (this.cardOpened.gameObject.x === card.gameObject.x && this.cardOpened.gameObject.y === card.gameObject.y) {
                            this.canMove = true;
                            return false;
                        }

                        card.flip(() => {
                            if (this.cardOpened.cardName === card.cardName) {
                                // ------- Match -------
                                this.sound.play("card-match");
                                // Destroy card selected and card opened from history
                                this.cardOpened.destroy();
                                card.destroy();

                                // Tăng số coin
                                this.coin += 10; // Tăng 10 xu mỗi lần ghép đúng
                                coinText.setText(`Coins: ${this.coin}`); // Cập nhật hiển thị số coin

                                // remove card destroyed from array
                                this.cards = this.cards.filter(cardLocal => cardLocal.cardName !== card.cardName);
                                // reset history card opened
                                this.cardOpened = undefined;
                                this.canMove = true;

                            } else {
                                // ------- No match -------
                                this.sound.play("card-mismatch");
                                this.cameras.main.shake(600, 0.01);
                                // remove life and heart
                                const lastHeart = hearts[hearts.length - 1];
                                this.add.tween({
                                    targets: lastHeart,
                                    ease: Phaser.Math.Easing.Expo.InOut,
                                    duration: 1000,
                                    y: - 1000,
                                    onComplete: () => {
                                        lastHeart.destroy();
                                        hearts.pop();
                                    }
                                });
                                this.lives -= 1;
                                // Flip last card selected and flip the card opened from history and reset history
                                card.flip();
                                this.cardOpened.flip(() => {
                                    this.cardOpened = undefined;
                                    this.canMove = true;

                                });
                            }

                            // Check if the game is over
                            if (this.lives === 0) {
                                // Show Game Over text
                                this.sound.play("whoosh", { volume: 1.3 });
                                this.add.tween({
                                    targets: gameOverText,
                                    ease: Phaser.Math.Easing.Bounce.Out,
                                    y: this.sys.game.scale.height / 2,
                                });

                                this.canMove = false;
                            }

                            // Check if the game is won
                            if (this.cards.length === 0) {
                                this.sound.play("whoosh", { volume: 1.3 });
                                this.sound.play("victory");

                                this.add.tween({
                                    targets: winnerText,
                                    ease: Phaser.Math.Easing.Bounce.Out,
                                    y: this.sys.game.scale.height / 2,
                                });
                                console.log(`Bạn đã thắng! Tổng số coin: ${this.coin}`);
                                this.canMove = false;
                            }
                        });

                    } else if (this.cardOpened === undefined && this.lives > 0 && this.cards.length > 0) {
                        // If there is not a card opened save the card selected
                        card.flip(() => {
                            this.canMove = true;
                        });
                        this.cardOpened = card;
                    }
                }
            }
            
        });


        // Text events
        winnerText.on(Phaser.Input.Events.POINTER_OVER, () => {
            winnerText.setColor("#FF7F50");
            this.input.setDefaultCursor("pointer");
        });
        winnerText.on(Phaser.Input.Events.POINTER_OUT, () => {
            winnerText.setColor("#8c7ae6");
            this.input.setDefaultCursor("default");
        });
        winnerText.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.sound.play("whoosh", { volume: 1.3 });
            this.add.tween({
                targets: winnerText,
                ease: Phaser.Math.Easing.Bounce.InOut,
                y: -1000,
                onComplete: () => {
                    this.restartGame();
                }
            })
        });

        gameOverText.on(Phaser.Input.Events.POINTER_OVER, () => {
            gameOverText.setColor("#FF7F50");
            this.input.setDefaultCursor("pointer");
        });

        gameOverText.on(Phaser.Input.Events.POINTER_OUT, () => {
            gameOverText.setColor("#8c7ae6");
            this.input.setDefaultCursor("default");
        });

        gameOverText.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.add.tween({
                targets: gameOverText,
                ease: Phaser.Math.Easing.Bounce.InOut,
                y: -1000,
                onComplete: () => {
                    this.restartGame();
                }
            })
        });
    }

}
