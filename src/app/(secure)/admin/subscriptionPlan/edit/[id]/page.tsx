import SubscriptionPlanForm from '../../SubscriptionPlanForm';

const EditSubscriptionPlan = ({ params }: { params: { id: string } }) => {
    return <SubscriptionPlanForm id={params.id} />;
};

export default EditSubscriptionPlan; 