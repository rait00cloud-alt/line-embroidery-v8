import ShowcaseLine from "@/components/Home/ShowcaseLine";
import RegisterPopup from "@/ui/RegisterPopup";

export default function HomePage() { 
  
  return (
  <section className="flex flex-col">
    <RegisterPopup/>
    <ShowcaseLine/>
   
  </section>


  );
}