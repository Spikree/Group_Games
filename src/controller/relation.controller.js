import Group from "../models/group.model.js";
import User from "../models/user.mode.js";

export const joinGroup = async (req, res) => {
  const { groupId } = req.body;

  const user = req.user;

  if (!groupId) {
    return res.status(400).json({
      message: "Invalid request"
    });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(400).json({
        message: "Group Does Not Exist"
      });
    }

    await group.updateOne(
      { $addToSet: { members: user._id } }
    );

    return res.status(200).json({
      message: "Joined Group"
    });
  } catch (e) {
    console.log("Error in joinGroup controller", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const leaveGroup = async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const user = req.user;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(400).json({
        message: "Group Does Not Exist"
      });
    }

    if (group.groupOwner.equals(user._id)) {
      return res.status(400).json({
        message: "You Cannot Leave The Group Until You Make Someone Else The Owner"
      });
    }

    await group.updateOne(
      { $pull: { members: user._id, admins: user._id } },
    );

    return res.status(200).json({
      message: "You Left The Group"
    })
  } catch (e) {
    console.log("Error in leaveGroup", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const makeAdmin = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const curUser = req.user;

  try {

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group does not exist" });
    }

    const isAdmin = group.groupOwner.equals(curUser._id);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Not Allowed"
      });
    }

    const userToPromote = await User.findById(userId);

    if (!userToPromote) {
      return res.status(400).json({
        message: "User Does Not Exist"
      });
    }

    if (!group.members.some((id) => id.equals(userToPromote._id))) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }



    await Group.updateOne(
        { _id: groupId },
        { $addToSet: {members: userId, admins: userId } }
      );

    return res.status(200).json({
      message: `${userToPromote.userName} Promoted To Admin`
    });
  } catch (e) {
    console.log("Error in makeAdmin", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const DemoteFromAdmin = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({
      message: "Invalid Request"
    })
  }

  const curUser = req.user;

  try {

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group Does Not Exist" });
    }

    const isAdmin = group.groupOwner.equals(curUser._id);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Not Allowed"
      });
    }

    const userToDemote = await User.findById(userId);

    if (!userToDemote) {
      return res.status(400).json({
        message: "User Does Not Exist"
      });
    }

    if (group.groupOwner.equals(userToDemote._id)) {
      return res.status(400).json({ message: "Cannot Demote The Group Owner" });
    }

    await Group.updateOne(
        { _id: groupId },
        { $pull: { admins: userId } }
      );

    return res.status(200).json({
      message: `${userToDemote.userName} Demoted`
    });
  } catch (e) {
    console.log("Error in DemoteFromAdmin", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const removeFromGroup = async (req,res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const currUser = req.user;

  try {

    const groupToRemoveFrom = await Group.findById(groupId);

    if (!groupToRemoveFrom) {
      return res.status(404).json({
        message: "Group Not Found"
      });
    }

    const canKick =
          groupToRemoveFrom.groupOwner.equals(currUser._id) ||
          groupToRemoveFrom.admins.some((id) => id.equals(currUser._id));

    if (!canKick) {
      return res.status(403).json({
        message: "Not Allowed, You Are Not An Admin Or The Owner"
      });
    }

    const userToKick = await User.findById(userId);

    if (!userToKick) {
      return res.status(404).json({
        message: "User Not Found"
      });
    }

    if (groupToRemoveFrom.groupOwner.equals(userId)) {
      return res.status(400).json({
        message: "Cannot Remove The Group Owner"
      });
    }

    if (!groupToRemoveFrom.groupOwner.equals(currUser._id) && groupToRemoveFrom.admins.some((id) => id.equals(userId))) {
      return res.status(400).json({
        message: "Only Owner Can Kick A Admin"
      });
    }

    await groupToRemoveFrom.updateOne({ $pull: { members: userId, admins: userId } });

    return res.status(200).json({
      message: `${userToKick.userName} Removed From The Group`
    });
  } catch (e) {
    console.log("Error in removeFromGroup", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
