import {Router} from "express";
var router = Router();

router.get("/:name", function(req, res) {
    res.render(`templates/${req.params.name}`, (error, html) => {
      if(error) {
        res.status(404).send(`Failed to get the view: ${req.params.name}`);
      } else {
        res.send(html);
      }
    });
});

export default router;
