"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { FaGithub, FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaDiscord } from "react-icons/fa";

/*
 * Vengeance UI "social flip button" (same markup, classes and animation as the original, light theme only).
 * Sizes are expressed in --u units (1u = 1px of the original 360px-wide component) so the whole button scales
 * with the column it sits in: the container is 360u wide = the width of column 3.
 */
export interface SocialItem {
  letter: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SocialFlipButtonProps {
  items?: SocialItem[];
  className?: string;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
  /** Every tile opens the visitor's email client with a message to this address */
  email?: string;
}

const u = (n: number) => `calc(var(--u) * ${n})`;

const SocialFlipNode = ({
  item,
  index,
  isHovered,
  setTooltipIndex,
  tooltipIndex,
  itemClassName,
  frontClassName,
  backClassName,
}: {
  item: SocialItem;
  index: number;
  isHovered: boolean;
  setTooltipIndex: (val: number | null) => void;
  tooltipIndex: number | null;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
}) => {
  const Wrapper = item.href ? "a" : "div";
  // mailto: links open the email client in place (no new tab)
  const wrapperProps = item.href ? { href: item.href } : { onClick: item.onClick };

  return (
    <Wrapper
      {...wrapperProps}
      aria-label={item.label}
      className={cn("relative cursor-pointer", itemClassName)}
      style={{ perspective: "1000px", width: u(40), height: u(40), flex: "none" }}
      onMouseEnter={() => setTooltipIndex(index)}
      onMouseLeave={() => setTooltipIndex(null)}
    >
      <AnimatePresence>
        {isHovered && tooltipIndex === index && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
            animate={{ opacity: 1, y: `calc(var(--u) * -50)`, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 z-50 whitespace-nowrap font-semibold text-white shadow-xl bg-neutral-900"
            style={{ borderRadius: u(8), padding: `${u(6)} ${u(12)}`, fontSize: u(12) }}
          >
            {item.label}
            <div className="absolute left-1/2 -translate-x-1/2 rotate-45 bg-neutral-900" style={{ bottom: u(-4), width: u(8), height: u(8) }} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120, damping: 15, delay: index * 0.08 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front - Letter */}
        <div
          className={cn("absolute inset-0 flex items-center justify-center font-bold text-neutral-800 shadow-sm", frontClassName)}
          style={{ backfaceVisibility: "hidden", borderRadius: u(8), fontSize: u(18) }}
        >
          {item.letter}
        </div>

        {/* Back - Icon */}
        <div
          className={cn("absolute inset-0 flex items-center justify-center bg-black text-white", backClassName)}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: u(8), fontSize: u(18) }}
        >
          {item.icon}
        </div>
      </motion.div>
    </Wrapper>
  );
};

export default function SocialFlipButton({ items, email, className, itemClassName, frontClassName, backClassName }: SocialFlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  const href = email ? `mailto:${email}` : "#";
  const list: SocialItem[] =
    items ??
    [
      { letter: "C", icon: <FaGithub />, label: "Github", href },
      { letter: "O", icon: <FaTwitter />, label: "Twitter", href },
      { letter: "N", icon: <FaLinkedin />, label: "LinkedIn", href },
      { letter: "T", icon: <FaInstagram />, label: "Instagram", href },
      { letter: "A", icon: <FaFacebook />, label: "Facebook", href },
      { letter: "C", icon: <FaEnvelope />, label: "Email", href },
      { letter: "T", icon: <FaDiscord />, label: "Discord", href },
    ];

  return (
    <div className={cn("flex items-center justify-start", className)} style={{ ["--u" as string]: "calc(3 * var(--h) / 360)" }}>
      <div
        className="group relative flex items-center justify-between"
        style={{ gap: u(8), borderRadius: u(16), width: u(360) }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipIndex(null);
        }}
      >
        {list.map((item, index) => (
          <SocialFlipNode
            key={index}
            item={item}
            index={index}
            isHovered={isHovered}
            setTooltipIndex={setTooltipIndex}
            tooltipIndex={tooltipIndex}
            itemClassName={itemClassName}
            frontClassName={frontClassName}
            backClassName={backClassName}
          />
        ))}
      </div>
    </div>
  );
}
