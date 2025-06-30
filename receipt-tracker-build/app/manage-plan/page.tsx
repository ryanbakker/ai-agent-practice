import SchematicComponent from "@/components/schematic/SchematicComponent";

function ManagePlan() {
  return (
    <div className="container xl:max-w-5xl mx-auto p-4 md:p-0 mb-10">
      <div>
        <h1 className="text-2xl font-bold mb-4 my-8">Manage Your Plan</h1>
        <p className="text-gray-600 mb-8">
          You can manage your subscription and billing details here.
        </p>
      </div>

      <div>
        <SchematicComponent
          componentId={
            process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMER_PORTAL_COMPONENT_ID
          }
        />
      </div>
    </div>
  );
}

export default ManagePlan;
