import Terms from "../models/termsModel.js"

export const getTerms=async(language)=>{

    const terms = await Terms.find({})
    let mappedTerms=[];
    switch (language) {
        case 'az':

        mappedTerms = terms.map(terms => ({
            ...terms.toObject(),
            termsName: terms.termsNameAz,
            termsDesc: terms.termsDescAz
          }));
          break;
        case 'de':

        mappedTerms = terms.map(terms => ({
            ...terms.toObject(),
            termsName: terms.termsNameGe,
            termsDesc: terms.termsDescGe
          }));
          break;
        default:
            mappedTerms = terms.map(terms => ({
                ...terms.toObject(),
                termsName: terms.termsNameAz,
                termsDesc: terms.termsDescAz
              }));
              break;
    }

    return await mappedTerms;
}