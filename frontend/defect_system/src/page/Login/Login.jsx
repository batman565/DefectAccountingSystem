import { observer } from "mobx-react-lite";
import { Header } from "../../component/Header";
import { LoginForm } from "../../component/LoginForm";

export const Login = observer(() => {
  return (
    <>
      <Header />
      <LoginForm></LoginForm>
    </>
  );
});
