import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, updateAccessToken } from "../store/Reducers/AuthReducer";
import { ROUTES } from "../constants/RouteConstants";
import { REFRESH_TOKEN } from "../constants/ApiConstants";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";

const useRefreshToken = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const Token = useSelector(
    (state: any) => state.AuthReducer.userData.refreshToken
  );

  const handleRefreshToken = async (): Promise<true | false> => {
    return new Promise<true | false>((resolve) => {
      BackendService.Post(
        {
          url: REFRESH_TOKEN,
          data: { refreshToken: Token },
        },
        {
          success: (response) => {
            const newAccessToken = response.accessToken;
            const newRefreshToken = response.refreshToken;
            dispatch(
              updateAccessToken({
                newToken: newAccessToken,
                newRefreshToken: newRefreshToken,
              })
            );
            resolve(true); 
          },
          failure: (error) => {
            dispatch(logout());
            navigate(ROUTES.LOGIN);
            resolve(false);
          },
        }
      );
    });
  };

  return handleRefreshToken;
};

export default useRefreshToken;
