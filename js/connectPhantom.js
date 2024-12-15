// connectPhantom.js
// Hiển thị số dư SOL trong ví của người chơi
async function displaySolBalance(walletAddress) {
    try {
        const balance = await getSolBalance(walletAddress);
        alert(`Địa chỉ ví: ${walletAddress}\nSố dư SOL: ${balance} SOL`);
    } catch (error) {
        console.error("Không thể hiển thị số dư SOL:", error);
    }
}

// Kết nối với ví Phantom
async function connectPhantom() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom Wallet chưa được cài đặt. Vui lòng cài đặt Phantom để tiếp tục.");
        return null;
    }

    try {
        const response = await window.solana.connect(); // Yêu cầu kết nối
        const walletAddress = response.publicKey.toString();
        console.log("Địa chỉ ví đã kết nối:", walletAddress);

        // Hiển thị số dư SOL
        await displaySolBalance(walletAddress);

        return walletAddress;
    } catch (error) {
        console.error("Không thể kết nối với Phantom:", error);
        alert("Không thể kết nối với ví Phantom. Vui lòng thử lại.");
        return null;
    }
}

// Lấy số dư SOL từ ví Phantom
async function getSolBalance(walletAddress) {
    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));
        const publicKey = new solanaWeb3.PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL; // Chuyển đổi từ lamports sang SOL
        return solBalance.toFixed(2); // Trả về số dư SOL với 2 chữ số thập phân
    } catch (error) {
        console.error("Không thể lấy số dư SOL:", error);
        return 0; // Nếu lỗi, trả về 0 SOL
    }
}

// Chuyển SOL từ ví người chơi vào ví game
async function transferSolToGameWallet(playerWalletAddress, solAmount) {
    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));

        // Tạo giao dịch
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(playerWalletAddress),
                toPubkey: new solanaWeb3.PublicKey("HPmvMuJruZXWKWNuLiUC9PyhDKMtRwiTiPrtpv9WegtP"), // Địa chỉ ví của game
                lamports: solAmount * solanaWeb3.LAMPORTS_PER_SOL // Chuyển đổi SOL sang lamports
            })
        );

        // Hiển thị giao dịch trong Phantom
        const signedTransaction = await window.solana.signAndSendTransaction(transaction);
        
        // Chờ xác nhận giao dịch
        const confirmation = await connection.confirmTransaction(signedTransaction.signature, "confirmed");

        if (confirmation.value.err) {
            console.error("Giao dịch không thành công:", confirmation.value.err);
            alert("Giao dịch thất bại!");
            return false;
        }

        console.log("Giao dịch thành công:", confirmation);
        alert("Giao dịch đã được xác nhận thành công!");
        return true;
    } catch (error) {
        console.error("Không thể chuyển SOL vào ví game:", error);
        alert("Có lỗi xảy ra khi chuyển SOL. Vui lòng thử lại.");
        return false;
    }
}
