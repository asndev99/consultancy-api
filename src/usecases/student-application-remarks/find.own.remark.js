import StudentApplicationRemarksRepository from "../../Infra/db/repositories/student-application-remarks/index.js";
import { ForBiddenException, NotFoundException } from "../../shared/error.js";

// Loads a remark within the actor's business and ensures the actor wrote it.
export const findOwnRemark = async (req, remarkId) => {
  const remark =
    await StudentApplicationRemarksRepository.FindStudentApplicationRemarkById(
      Number(remarkId),
      req.user.businessId || null,
    );

  if (!remark) {
    throw new NotFoundException("Remark not found");
  }

  if (remark.authorId !== req.user.id) {
    throw new ForBiddenException("You can only modify your own remarks");
  }

  return remark;
};
