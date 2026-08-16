import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { BadRequestException } from "../../shared/error.js";


export const  RegisterBusinessUseCase = async (req,payload) => {
    const business = await BusinessRepository.findBusinessByName(payload.name);
    if(business){
        throw new BadRequestException("Business with this name already exists");
    }
    return BusinessRepository.RegisterBusiness(payload);
}
