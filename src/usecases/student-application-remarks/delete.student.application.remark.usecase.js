import StudentApplicationRemarksRepository from "../../Infra/db/repositories/student-application-remarks/index.js";
import { findOwnRemark } from "./find.own.remark.js";

export const DeleteStudentApplicationRemarkUseCase = async (req, remarkId) => {
  const remark = await findOwnRemark(req, remarkId);

  return StudentApplicationRemarksRepository.DeleteStudentApplicationRemark(
    remark.id,
    {
      deletedAt: new Date(),
      deletedBy: req.user.id,
    },
  );
};
