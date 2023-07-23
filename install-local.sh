echo "Starting DFX server..."

dfx stop
dfx start --clean --background

dfx deploy crud_canister --argument '(principal "m4euk-ov63d-o5mkf-325eb-rupo6-zhlw4-qjni4-iurwu-5cejs-2bziq-cae")' --upgrade-unchanged

dfx deploy identity

export MINT_ACC=$(dfx ledger account-id)
export LEDGER_ACC=$(dfx ledger account-id)
export ARCHIVE_CONTROLLER=$(dfx identity get-principal)

dfx deploy ledger --argument '(record {minting_account = "'${MINT_ACC}'"; initial_values = vec { record { "'${LEDGER_ACC}'"; record { e8s=100_000_000_000 } }; }; send_whitelist = vec {}})'

export CRUD_PRINCIPAL=$(dfx canister id crud_canister)

dfx deploy nft --argument '(service "'${CRUD_PRINCIPAL}'")'

npm run generate:types

dfx deploy assets

dfx canister install nft --argument '(service "'${CRUD_PRINCIPAL}'")' --mode reinstall


dfx canister call ledger transfer '(record {memo = 1234; amount = record { e8s=2_500_000_000 }; fee = record { e8s=0 }; to = '$(python3 -c 'print("vec{" + ";".join([str(b) for b in bytes.fromhex("c1410e320bd8ad4a826064671c2b7d096aef7ce932a16fb9a7ce290e9349b60d")]) + "}")')'; created_at_time = null })'


dfx wallet --network local send ryjl3-tyaaa-aaaaa-aaaba-cai 800000000000
dfx canister install fiat --mode reinstall
