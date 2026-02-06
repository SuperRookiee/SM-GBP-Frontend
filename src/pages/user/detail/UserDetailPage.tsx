import { useParams } from "react-router-dom";

const UserDetailPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            ID : {id}
        </div>
    );
};

export default UserDetailPage;