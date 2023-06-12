import User from "../models/userModel.js"
import * as joinUsService from "../services/joinUsService.js"
import * as aboutService from "../services/aboutService.js"
import * as projectService from "../services/projectService.js"
import * as newsService from "../services/newsService.js"
import * as termsService from "../services/termsService.js"
import * as userService from "../services/userService.js"



const getIndexPage =async (req, res) => {
    const about = await aboutService.getAbout(req.cookies.language)
    const projects = await projectService.getProjects(req.cookies.language)
    const newses =  await newsService.getNews(req.cookies.language)
    const users = await userService.getUser(req.cookies.language, "reyaset_heyyeti_uzvleri" );
    const president = await userService.getUser(req.cookies.language, "rehber_uzv" );
   

    res.render('index', {
        link: "index",
        about,
        projects,
        newses,
        users,
        president
    })
}
const getAboutPage = async (req, res) => {
    const about = await aboutService.getAbout(req.cookies.language)

    res.render('about', {
        link: "about",
        about
    })
  
}
const getJoinUsPage = async (req, res) => {
    const joinUs = await joinUsService.getJoinUs(req.cookies.language)
    const lang = req.cookies.language
    res.render('joinUs', {
        link: "joinUs",
        joinUs,
        lang,
        
        
    })
}

const getMembersPage = async (req, res) => {
    const users = await User.find({ role: "reyaset_heyyyeti_uzvleri" });
    const president = await User.find({ role: "rehber_uzv" });

    res.render('members', {
        link: "members",
        users,
        president
    })
}
const getAllMembersPage = async (req, res) => {
    const terms = await termsService.getTerms(req.cookies.language)
    res.render('allMembers', {
        link: "allMembers",
        terms
    });
}
const getProjectsPage = async (req, res) => {
    const pageNumber = req.query.page || 1; // İstek parametresinden sayfa numarasını alın
    const limit = 6; // Her sayfada kaç projenin görüntüleneceğini belirtin
    const language = req.cookies.language; // Dil bilgisini alın veya uygun şekilde elde edin
  
    try {
      const { projects, totalPages } = await projectService.getProjects(pageNumber, limit, language);
  
      res.render('projects', {
        link: 'projects',
        projects,
        currentPage: pageNumber,
        totalPages,
      });
    } catch (error) {
      res.status(500).json({
        succeeded: false,
        error,
      });
    }
  };



const getRegisterPage = (req, res) => {
    res.render('register', {
        link: "register"
    })
}

const getLoginPage = (req, res) => {
  const data= req.session.data
   req.session.data = undefined
    res.render('login', {
        link: "login",
        data
    })
}

const getLogout = (req, res) => {

    res.cookie("jwt", "", {
        maxAge: 1,
    });
    res.redirect('/')
}



export { getIndexPage, getJoinUsPage, getProjectsPage, getAboutPage, getMembersPage, getAllMembersPage, getRegisterPage, getLoginPage, getLogout };