"use client";
import DateCounter from "@/components/EventOverviewComponent/dateCounter";
import EventDetails from "@/components/EventOverviewComponent/EventDetails";
import React from "react";
import test from "@/Assets/test.png";
import Image from "next/image";
import Description from "@/components/EventOverviewComponent/Description";
import LocationCard from "@/components/EventOverviewComponent/LocationCard";
import TermsConditions from "@/components/EventOverviewComponent/TermCondition";

function Eventoverview() {
  return (
    //banner
    <div className="m-10 ">
      <div className="w-full h-[500px] relative">
        <Image
          src={test}
          alt="Hero Banner"
          layout="fill"
          objectFit="cover"
          priority
          className="rounded-lg"
        />
      </div>
      <div className="relative z-10 lg:-mt-24 mx-auto px-6 w-full max-w-screen-lg sm: mt-20">
        <DateCounter targetDate={new Date("2025-03-29T16:00:00")} />
      </div>
      <div className="flex my-20 gap-0">
        <Description
          description="hamber
  To the lascivious pleasing of a lute.
  But I, that am not shaped for sportive tricks,
  Nor made to court an amorous looking-glass;
  I, that am rudely stamp'd, and want love's majesty
  To strut before a wanton ambling nymph;
  I, that am curtail'd of this fair proportion,
  Now is the winter of our discontent
  Made glorious summer by this sun of York;
  And all the clouds that lour'd upon our house
  In the deep bosom of the ocean buried.
  Now are our brows bound with victorious wreaths;
  Our bruised arms hung up for monuments;
  Our stern alarums changed to merry meetings,
  Our dreadful marches to delightful measures.
  Grim-visaged war hath smooth'd his wrinkled front;
  And now, instead of mounting barded steeds
  To fright the souls of fearful adversaries,
  He capers nimbly in a lady's chamber
  To the lascivious pleasing of a lute.
  But I, that am not shaped for sportive tricks,
  Nor made to court an amorous looking-glass;
  I, that am rudely stamp'd, and want love's majesty
  To strut before a wanton ambling nymph;
  I, that am curtail'd of this fair proportion,
  "
        />
        <div className="w-1/3 ml-20">
          <EventDetails
            title="check"
            type="music"
            date="march 29"
            time="4PM"
            location="gurgaon"
          />
        </div>
      </div>
      <div>
        <LocationCard
          title="Leisure Valley Ground, Gurugram"
          address="Sector 29, Gurugram, Haryana, India"
          googleMapLink="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.514089339545!2d77.06366007540564!3d28.55656207565806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d18f6a2dc5f8d%3A0x981b92b9c3b5c1e0!2sLeisure%20Valley%20Park!5e0!3m2!1sen!2sin!4v1646036989873!5m2!1sen!2sin"
        />
      </div>
      <div>
        <TermsConditions
          terms="hamber
  To the lascivious pleasing of a lute.
  But I, that am not shaped for sportive tricks,
  Nor made to court an amorous looking-glass;
  I, that am rudely stamp'd, and want love's majesty
  To strut before a wanton ambling nymph;
  I, that am curtail'd of this fair proportion,
  Now is the winter of our discontent
  Made glorious summer by this sun of York;
  And all the clouds that lour'd upon our house
  In the deep bosom of the ocean buried.
  Now are our brows bound with victorious wreaths;
  Our bruised arms hung up for monuments;
  Our stern alarums changed to merry meetings,"
        />
      </div>
    </div>
  );
}

export default Eventoverview;
