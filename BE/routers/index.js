import userRouter from '../modules/user/user.routes.js'

const useRoutes = (app) => {
    app.use('/api/user', userRouter);
};

export default useRoutes;
