// memoryGame.js

// Phaser Scene cho trò chơi Memory Game
class MemoryGame extends Phaser.Scene {
    constructor() {
        super({ key: "MemoryGame" });
    }

    create() {
        // Tạo mảng items với coin ban đầu là 0
        this.items = [
            {
                coin: 0
            }
        ];

        // Nút kết nối Phantom
        const connectButton = this.add.text(this.sys.game.scale.width / 2, 100, 'Connect Phantom', {
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

        // Hiển thị số coin ban đầu
        this.coinText = this.add.text(this.sys.game.scale.width / 2, 200, `Coins: ${this.items[0].coin}`, {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFD700'
        }).setOrigin(0.5);

        // Nút tăng coin
        const increaseButton = this.add.text(this.sys.game.scale.width / 2 - 100, 300, 'Increase Coin', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#fff',
            backgroundColor: '#28a745',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        increaseButton.on('pointerdown', () => {
            this.items[0].coin += 10; // Tăng 10 coin
            this.coinText.setText(`Coins: ${this.items[0].coin}`);
        });

        // Nút giảm coin
        const decreaseButton = this.add.text(this.sys.game.scale.width / 2 + 100, 300, 'Decrease Coin', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#fff',
            backgroundColor: '#dc3545',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        decreaseButton.on('pointerdown', () => {
            if (this.items[0].coin > 0) {
                this.items[0].coin -= 10; // Giảm 10 coin
                this.coinText.setText(`Coins: ${this.items[0].coin}`);
            } else {
                alert("Không đủ coin để giảm!");
            }
        });
    }

    // Hiển thị số dư SOL
    displaySolBalance(walletAddress) {
        const solText = this.add.text(this.sys.game.scale.width / 2, 250, 'Loading SOL...', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFD700'
        }).setOrigin(0.5);

        // Lấy và hiển thị số dư SOL
        getSolBalance(walletAddress).then(solBalance => {
            solText.setText(`SOL Balance: ${solBalance} SOL`);
        }).catch(error => {
            solText.setText('Không thể lấy số dư SOL');
        });
    }
}

// Cấu hình Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: MemoryGame,
    // scale: {
    //     mode: Phaser.Scale.FIT,
    //     autoCenter: Phaser.Scale.CENTER_BOTH
    // }
};

const game = new Phaser.Game(config);
