import Group from "../models/group.model.js";
import User from "../models/user.mode.js";
import GroupJoinRequest from "../models/groupJoinRequests.model.js";
import { nanoid } from "../libs/inviteKeyCreator.js";
import cloudinary from "../libs/cloudinary.js";
import fs from "fs"
import { group } from "console";

export const createGroup = async (req, res) => {
  const { groupName, groupDescription, isPrivate } = req.body;

  if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  if (!groupName) {
    return res.status(400).json({
      message: "Invalid Request : Group Name Is Requred"
    });
  }

  const currUser = req.user;

  try {

    const newGroup = new Group({
      groupName,
      groupDescription,
      inviteCode: nanoid(),
      isPrivate,
      groupOwner: currUser._id,
      members: [currUser._id],
      admins: [currUser._id],
    });

    await newGroup.save();

    return res.status(201).json({
      message: `New Group ${groupName} Created`
    });
  } catch (e) {
    console.log("Error in Create Group", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const joinGroup = async (req, res) => {
  const { inviteCode } = req.body;

  const user = req.user;

  if (!inviteCode) {
    return res.status(400).json({
      message: "Invalid request"
    });
  }

  try {
    const group = await Group.findOne({inviteCode:inviteCode});

    if (!group) {
      return res.status(400).json({
        message: "Group Does Not Exist"
      });
    }

    if (group.members.some((id) => id.equals(user._id))) {
      return res.status(400).json({ message: "You Are Already In This Group" });
    }

    if (group.isPrivate) {
      try {
        const groupJoinRequest = await GroupJoinRequest.findOne({
          requesterId: user._id,
          groupId: group._id
        });

        if (groupJoinRequest) {
          return res.status(400).json({
            message: "You Have Already Sent A Request To Join The Group"
          });
        }

        const newGroupJoinRequest = new GroupJoinRequest({
          requesterId: user._id,
          groupId: group._id,
        });

        await newGroupJoinRequest.save();

        return res.status(200).json({
          message: "Join Request Sent",
        });
      } catch (e) {
        console.log("Error in join group", e.message);
        return res.status(500).json({
          message: "Internal Server Error"
        });
      }
    }

    await group.updateOne(
      { $addToSet: { members: user._id } }
    );

    return res.status(200).json({
      message: "Joined Group",
      group: { _id: group._id, groupName: group.groupName },
    });
  } catch (e) {
    console.log("Error in joinGroup controller", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const getJoinRequests = async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const currUser = req.user;

  try {

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group Does Not Exist"
      });
    }

    const canAccessRequests = group.groupOwner.equals(currUser._id) || group.admins.some((id) => id.equals(currUser._id));

    if (!canAccessRequests) {
      return res.status(400).json({
        message: "Not Allowed"
      })
    }

    const requests = await GroupJoinRequest.find({ groupId: groupId, isAccepted: false }).
      populate("requesterId", "userName profile.name");

    if (requests.length === 0) {
      return res.status(200).json({
        message: "No New Join Requests"
      });
    }

    return res.status(200).json({
      message: "Requests",
      requests
    });
  } catch (e) {
    console.log("Error in getJoinRequests", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const acceptJoinRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const currUser = req.user;

  try {
    const request = await GroupJoinRequest.findById(requestId);

    if (!request) {
      return res.status(400).json({
        message: "Request Not Found"
      });
    }

    if (request.isAccepted) {
      return res.status(400).json({
        message: "Request Has Already Been Accepted"
      });
    }

    const group = await Group.findById(request.groupId);

    if (!group) {
      return res.status(400).json({
        message: "Group Does Not Exist Anymore"
      });
    }

    const canAccept =
      group.groupOwner.equals(currUser._id) ||
      group.admins.some((id) => id.equals(currUser._id));

    if (!canAccept) {
      return res.status(403).json({ message: "Not Allowed" });
    }

    await group.updateOne(
      { $addToSet: { members: request.requesterId } }
    );

    await request.deleteOne();


    return res.status(200).json({
      message: "Request Accepted",
      group: { _id: group._id, groupName: group.groupName },
    });
  } catch (e) {
    console.log("Error in acceptJoinRequest", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const rejectJoinRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const currUser = req.user;

  try {
    const request = await GroupJoinRequest.findById(requestId);

    if (!request) {
      return res.status(400).json({
        message: "Request Not Found"
      });
    }

    if (request.isAccepted) {
      return res.status(400).json({
        message: "Request Has Already Been Accepted"
      });
    }

    const group = await Group.findById(request.groupId);

    if (!group) {
      return res.status(400).json({
        message: "Group Does Not Exist Anymore"
      });
    }

    const canReject =
      group.groupOwner.equals(currUser._id) ||
      group.admins.some((id) => id.equals(currUser._id));

    if (!canReject) {
      return res.status(403).json({ message: "Not Allowed" });
    }

    await request.deleteOne();

    return res.status(200).json({
      message: "Rejected Request",
      group: { _id: group._id, groupName: group.groupName },
    });
  } catch (e) {
    console.log("Error in rejectJoinRequest", e.message);
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

export const transferOwnership = async (req, res) => {
  const { toTransferToUserId, groupId } = req.body;

  if (!toTransferToUserId || !groupId) {
    return res.status(400).json({
      message: "Invalid Request"
    });
  }

  const currUser = req.user;

  try {

    const user = await User.findById(toTransferToUserId);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found"
      })
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group Not Found"
      });
    }

    const isUserInGroup = group.members.some((id) => id.equals(toTransferToUserId));

    if (!isUserInGroup) {
      return res.status(400).json({
        message : "New Owner Must Already Be In The Group"
      })
    }

    const isCurrentUserOwner = group.groupOwner.equals(currUser._id);

    if (!isCurrentUserOwner) {
      return res.status(403).json({
        message: "You Are Not The Owner Of This Group"
      });
    }

    const isTheNewOwnerAlreadyAOwner = group.groupOwner.equals(toTransferToUserId);

    if (isTheNewOwnerAlreadyAOwner) {
      return res.status(400).json({
        message: "User Is Already The Group Owner"
      });
    }

    await group.updateOne({
      $set: { groupOwner: toTransferToUserId },
      $addToSet: {
        members: { $each: [ currUser._id] },
        admins: { $each: [ toTransferToUserId ,currUser._id] },
      },
    });

    return res.status(200).json({
      message: `${user.userName} Is The New Group Owner`
    });
  } catch (e) {
    console.log("Error in transferOwnership", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const updateGroupLogo = async (req, res) => {
  const { groupId } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No File Uploaded" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group Not Found" });
    }
    const canEdit =
      group.groupOwner.equals(req.user._id) ||
      group.admins.some((id) => id.equals(req.user._id));

    if (!canEdit) {
      return res.status(403).json({ message: "Not Allowed" });
    }

    let imageUrl;
    try {
      const fileLink = await cloudinary.uploader.upload(req.file.path, {
        folder: "group_logos",
      });
      imageUrl = fileLink.secure_url;
    } finally {
      await fs.promises.unlink(req.file.path);
    }

    await group.updateOne({ $set: { groupLogo: imageUrl } });

    return res.status(200).json({ message: "Logo Updated", groupLogo: imageUrl });
  } catch (e) {
    console.log("Error in updateGroupLogo", e.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyGroups = async (req, res) => {
  const user = req.user;

  try {
    const userGroups = await Group.find({ members: user._id }).select("groupName groupDescription groupLogo isPrivate").lean();

    return res.status(200).json({
      userGroups
    });
  } catch (e) {
    console.log("Error in getMyGroups", e.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
