const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const borsh = require('borsh');
const utils = require('./utils.js');
const request = require('request');


console.log('hi')

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new solanaWeb3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const METADATA_PUBKEY = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

async function findAssociatedTokenAddress(
    walletAddress,
    tokenMintAddress
) {
    return (await solanaWeb3.PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            splToken.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    ))[0];
}

async function getNFTData(ownerAddress) {
    var connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('mainnet-beta'),
        'confirmed',
    );

    // Get token accounts from wallet
    tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerAddress, {
        programId: splToken.TOKEN_PROGRAM_ID
    });
    console.log("Token Accounts");
    console.log(tokenAccounts);

    // Iterate over all token accounts
    await tokenAccounts.value.forEach(async function(tAccount) {
        //await connection.getTokenAccountBalance
        tokenAmount = tAccount.account.data.parsed.info.tokenAmount;

        // Check that it's an NFT
        if (tokenAmount.amount == "1" && tokenAmount.decimals == "0") {
            console.log(tAccount);

            let [pda, bump] = await solanaWeb3.PublicKey.findProgramAddress([
                "metadata",
                METADATA_PUBKEY.toBuffer(),
                (new solanaWeb3.PublicKey(tAccount.account.data.parsed.info.mint)).toBuffer(),
            ], METADATA_PUBKEY);

            console.log("Metadata");
            console.log(pda.toString());

            // Parse PDA to get NFT metadata
            accountInfo = await connection.getParsedAccountInfo(pda);

            // console.log("Account Info");
            // console.log(accountInfo);

            const decoded = utils.decodeMetadata(accountInfo.value.data);
            const uri = decoded.data.uri;
            console.log(uri);

            request.get(uri, (error, response, body) => {
                let json = JSON.parse(body);
                console.log(json.image);
            })
        }
    });
}

getNFTData(new solanaWeb3.PublicKey("EUMxCpJ6mvmCU9bNn26TaKPCVzrk5Ccj2NV2VpVXGVyk"));