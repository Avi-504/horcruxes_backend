import jwt from "jsonwebtoken";

// Middleware to check if the user is authenticated (eg like a post or comment on a post then the user must be authenticated first)

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, "test");

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      // Google OAuth unique ID
      req.userId = decodedData?.sub;
    }
    //this populates the req object with the user id so that we can use it in the controllers/next action(i.e our controllers will have access to the user id in req)
    next();
  } catch (error) {
    console.log("Error in auth middleware");
    console.log(error);
  }
};

export default auth;
