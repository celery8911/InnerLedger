Subgraph for InnerLedger

What it indexes
- RecordCreated events from InnerLedger
- Stores contentHash, user, timestamp, transactionHash, blockNumber

Quick start (Graph CLI)
1) Install tools
   npm i -g @graphprotocol/graph-cli

2) Generate types
   graph codegen subgraph.yaml

3) Build
   graph build subgraph.yaml

Deploy
- Update the `network` field in subgraph.yaml to the network name required by your indexing provider.
- Then deploy with your Graph Studio credentials.

Query example
{
  recordCreateds(where: { contentHash: "0x..." }) {
    contentHash
    transactionHash
    timestamp
    user
  }
}
