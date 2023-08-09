import Project from "../../../models/projectModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// const createProject = async (req, res) => {
//     try {
//       const projects = await Project.create(req.body);
//       res.status(201).redirect("/admin/projects")
//     } catch (error) {
//       res.status(500).json({
//         succeded: false,
//         error
//       })
//     }
//   };
const createProject = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        unique_filename: true,
        folder: 'damvev_de'
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const projects = new Project({
        titleAz: req.body.titleAz,
        titleGe: req.body.titleGe,
        descriptionAz: req.body.descriptionAz,
        descriptionGe: req.body.descriptionGe,
        videoUrl: req.body.videoUrl,
        url: result.secure_url,
        image_id: result.public_id
      });

      await projects.save();

      fs.unlinkSync(req.files.image.tempFilePath);
    } else {
      const projects = new Project({
        titleAz: req.body.titleAz,
        titleGe: req.body.titleGe,
        descriptionAz: req.body.descriptionAz,
        descriptionGe: req.body.descriptionGe,
        videoUrl: req.body.videoUrl
      });

      await projects.save();
    }

    res.status(201).redirect('/admin/projects');
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};


  const getAllProject = async (req, res) => {
   
    const projects = await Project.find({})
  
    res.render('../areas/admin/views/project/projects', {
     projects
    })
  }
  const getUpdateProject = async (req, res) => {
    try {
      const project = await Project.findById({ _id: req.params.id });
      res.status(200).render('../areas/admin/views/project/update', {
       project
      })
    } catch (error) {
      res.status(500).json({
        succeded: false,
        error
      })
    }
  }

  const updateProject = async (req, res) => {
    try {
      const projectId = req.params.id; // Proje kimliğini alın
  
      // Mevcut projeyi veritabanından bulun
      const existingProject = await Project.findById(projectId);

      if (!existingProject) {
        return res.status(404).json({
          succeeded: false,
          error: 'Proje bulunamadı'
        });
      }
  
      // Resim güncellemesi
      if (req.files && req.files.image) {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          unique_filename: true,
          folder: 'damvev_de'
        });
  
        if (result.error) {
          throw new Error(result.error.message);
        }
  
        // Önceki resmi Cloudinary'den kaldırın
        if (existingProject.image_id) {
          await cloudinary.uploader.destroy(existingProject.image_id);
        }
  
        // Güncellenmiş resim bilgilerini güncelle
        existingProject.url = result.secure_url;
        existingProject.image_id = result.public_id;
  
        fs.unlinkSync(req.files.image.tempFilePath);
      }
  
      // Diğer alanları güncelle
      existingProject.titleAz = req.body.titleAz;
      existingProject.titleGe = req.body.titleGe;
      existingProject.descriptionAz = req.body.descriptionAz;
      existingProject.descriptionGe = req.body.descriptionGe;
      existingProject.videoUrl = req.body.videoUrl;
  
      // Projeyi kaydet
      await existingProject.save();
  
      res.status(200).redirect('/admin/projects');
    } catch (error) {
      res.status(500).json({
        succeeded: false,
        error: error.message
      });
    }
  };

  // const updateProject = async (req, res) => {
  //   try {
  //     const project = await Project.findById(req.params.id);
  //     project.title = req.body.title;
  //     project.description = req.body.description;
  //     project.videoUrl = req.body.videoUrl;
    
  
  //     await project.save();
  //     res.redirect("/admin/projects");
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       error: error.message,
  //     });
  //   }
  // };
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

  // const  deleteProject =async (req, res) => {
  //   try {
  //     await Project.findByIdAndDelete(req.params.id)

  //     res.redirect("/admin/projects")
      
  //   } catch (error) {
  //     res.status(500).json({
  //       succeded: false,
  //       error
  //     })
  //   }
    
  // };

  const deleteProject = async (req, res) => {
    try {
      
      const project = await Project.findById({ _id: req.params.id });
      console.log('Seçilen proje:', project)
      // Resmi sil (varsa)
      if (project.image_id) {
        await cloudinary.uploader.destroy(project.image_id);
      }
  
      // Projeyi sil
      await Project.findByIdAndDelete({ _id: req.params.id });
  
      res.redirect("/admin/projects");
    } catch (error) {
      res.status(500).json({
        succeeded: false,
        error: error.message
      });
    }
  };


  const getProjectDetail = async (req, res) => {
    try {
      const project = await Project.findById({ _id: req.params.id });
      
      res.status(200).render('../areas/admin/views/project/detail', {
        project,
      });
      
    } catch (error) {
      res.status(500).json({
        succeeded: false,
        error,
      });
    }
  };
  
  
  export { createProject,getAllProject,getUpdateProject ,updateProject,deleteProject,getProjectDetail};