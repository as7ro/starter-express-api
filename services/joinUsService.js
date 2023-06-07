import JoinUs from "../models/joinUsModel.js"

export const getJoinUs=async(language)=>{

    const joinUs = await JoinUs.findOne({})
    let mappedJoinUs;
    switch (language) {
        case 'az':

            mappedJoinUs = {
                ...joinUs._doc,
                description: joinUs.descriptionAz
            }
            break;
        case 'de':

        mappedJoinUs = {
                ...joinUs._doc,
               
                description: joinUs.descriptionGe
            }
            break;
        default :
            mappedJoinUs = {
                ...joinUs._doc,
                description: joinUs.descriptionAz
            }
            break;
    }

    return await mappedJoinUs;
}