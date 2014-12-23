import {Router} from 'express';

var router = Router();

router.route("/")
.get((req, res) => {
  res.render("index", {user: req.user});
});

export default router;
