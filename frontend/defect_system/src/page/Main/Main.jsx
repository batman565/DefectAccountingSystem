import { observer } from "mobx-react-lite";
import { Header } from "../../component/Header";
import { ObjectList } from "../../component/ObjectList";

export const Mainpage = observer(() => {
  return (
    <>
      <Header />
      <ObjectList />
    </>
  );
});
