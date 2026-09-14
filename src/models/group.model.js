import mongoose from "mongoose";

const schema = mongoose.Schema;

const groupSchema = schema({
  groupName: { type: String, required: true, unique: true },
  groupLogo: {type: String},
  groupOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]

},
  { timestamps: true }
);

groupSchema.index({ members: 1 });

export default mongoose.model("Group", groupSchema);
