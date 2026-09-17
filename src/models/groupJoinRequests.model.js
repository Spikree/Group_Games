import mongoose from "mongoose";

const schema = mongoose.Schema;

const groupJoinRequestSchema = schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId,ref: "User", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref:"Group" ,required: true },
  isAccepted: {
    type: Boolean, default: false
  }
},
  { timestamps: true }
);

groupJoinRequestSchema.index({ requesterId: 1, groupId: 1 }, { unique: true });

export default mongoose.model('GroupJoinRequest', groupJoinRequestSchema);
