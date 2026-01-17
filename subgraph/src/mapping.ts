import { RecordCreated as RecordCreatedEvent } from "../generated/InnerLedger/InnerLedger";
import { RecordCreated } from "../generated/schema";

export function handleRecordCreated(event: RecordCreatedEvent): void {
  const entity = new RecordCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString(),
  );
  entity.user = event.params.user;
  entity.contentHash = event.params.contentHash;
  entity.timestamp = event.params.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();
}
