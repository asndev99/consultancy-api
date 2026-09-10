import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function GetUniversitiesByBusinessId(
  businessId,
  page = 1,
  pageSize = 10,
  filters = {},
) {
  const [count, universities] = await Promise.all([
    UniversityRepository.CountUniversitiesByBusinessId(+businessId, filters),
    UniversityRepository.findUniversitiesByBusinessId(
      +businessId,
      page,
      pageSize,
      filters,
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
