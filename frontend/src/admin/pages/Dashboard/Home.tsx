import PageMeta from "../../components/common/PageMeta";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics.tsx";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Admin Dashboard"
        description="This is React.js  Dashboard pag"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">

        <div className="col-span-12">
            <EcommerceMetrics />

            <MonthlySalesChart />
        </div>
      </div>
    </>
  );
}
