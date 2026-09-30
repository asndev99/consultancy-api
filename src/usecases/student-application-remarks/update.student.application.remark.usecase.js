import StudentApplicationRemarksRepository from "../../Infra/db/repositories/student-application-remarks/index.js";
import { findOwnRemark } from "./find.own.remark.js";

export const UpdateStudentApplicationRemarkUseCase = async (
  req,
  remarkId,
  comment,
) => {
  const remark = await findOwnRemark(req, remarkId);

  return StudentApplicationRemarksRepository.UpdateStudentApplicationRemark(
    remark.id,
    {
      comment,
      updatedBy: req.user.id,
    },
  );
};
