import Terms from "../../../models/termsModel.js";



const createTerms = async (req, res) => {
    try {
      const terms = await Terms.create(req.body);
      res.status(201).redirect("/admin/terms")
    } catch (error) {
      res.status(500).json({
        succeded: false,
        error
      })
    }
  };


  const getTermsPage = async (req, res) => {
   
    const terms = await Terms.find({})
  
    res.render('../areas/admin/views/terms/terms', {
     terms
    })
  }


  const getUpdateTerms = async (req, res) => {
    try {
      const terms = await Terms.findById({ _id: req.params.id });
      res.status(200).render('../areas/admin/views/terms/update', {
       terms
      })
    } catch (error) {
      res.status(500).json({
        succeded: false,
        error
      })
    }
  }

  const updateTerms = async (req, res) => {
    try {
      const terms = await Terms.findById(req.params.id);
      terms.termsNameAz = req.body.termsNameAz;
      terms.termsNameGe = req.body.termsNameGe;
      terms.termsDescAz = req.body.termsDescAz;
      terms.termsDescGe = req.body.termsDescGe;
      await terms.save();
      res.redirect("/admin/terms");
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
  // const deleteProject = async (req, res) => {
  //   try {
     
  //     // Haberi sil
  //     await Project.findByIdAndDelete(req.params.id);
  //     res.redirect("/admin/projects");
  //   } catch (error) {
  //     res.status(500).json({
  //       succeeded: false,
  //       error
  //     });
  //   }
  // };

  const  deleteTerms =async (req, res) => {
    try {
      await Terms.findByIdAndDelete(req.params.id)

      res.redirect("/admin/terms")
      
    } catch (error) {
      res.status(500).json({
        succeded: false,
        error
      })
    }
    
  };
  const getTermsDetail = async (req, res) => {
    try {
      const terms = await Terms.findById({ _id: req.params.id });
      
      res.status(200).render('../areas/admin/views/terms/detail', {
        terms,
      });
      
    } catch (error) {
      res.status(500).json({
        succeeded: false,
        error,
      });
    }
  };
  
  
  export { createTerms,getTermsPage,getUpdateTerms ,updateTerms,deleteTerms,getTermsDetail};