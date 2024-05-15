import { VariantProps, cva } from "class-variance-authority";

const profileStatBoxVariants = cva(
  "relative p-[1.5px] rounded overflow-hidden",
  {
    variants: {
      colorScheme: {
        violet: [
          "[--profile-stat-box-color:theme(colors.brand.primary.DEFAULT)]",
        ],
        emerald: ["[--profile-stat-box-color:theme(colors.emerald.400)]"],
        white: ["[--profile-stat-box-color:theme(colors.brand.white.DEFAULT)]"],
      },
    },
    defaultVariants: {
      colorScheme: "violet",
    },
  }
);

type ProfileStatBoxProps = {
  title: string;
  stat: string | number;
  description: string;
} & VariantProps<typeof profileStatBoxVariants>;
export const ProfileStatBox = ({
  title,
  stat,
  description,
  colorScheme,
}: ProfileStatBoxProps) => {
  return (
    <div className={profileStatBoxVariants({ colorScheme })}>
      <div className="absolute inset-0 bg-gradient-to-b from-[--profile-stat-box-color] to-brand-gray" />
      <div className="h-full relative flex flex-col items-center justify-center bg-brand-navy gap-1 rounded p-2.5">
        <p className="text-center text-brand-white font-accent">{title}</p>
        <p className="text-center text-4xl text-[--profile-stat-box-color] font-accent">
          {stat}
        </p>
        <p className="text-center text-brand-gray font-accent">{description}</p>
      </div>
    </div>
  );
};
