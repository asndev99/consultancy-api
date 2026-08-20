import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function GetUniversitiesByBusinessId(
  businessId,
  page = 1,
  pageSize = 10,
) {
  const [count, universities] = await Promise.all([
    UniversityRepository.CountUniversitiesByBusinessId(businessId),
    UniversityRepository.findUniversitiesByBusinessId(
      businessId,
      page,
      pageSize,
    ),
  ]);

  return {
    data: universities,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}
