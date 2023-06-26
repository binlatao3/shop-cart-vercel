module.exports = function checkUser(url) {
    return function (req, res, next) {
        var user = req.session.user
        if(url === 0)
        {
            if (user)
            {
                res.redirect('/');
            }
            else
            {
                next()
            }
        }
        else
        {
            if (!user)
            {
                res.redirect('/user/login');
            }
            else
            {
                next()
            }
        }
    }
  }