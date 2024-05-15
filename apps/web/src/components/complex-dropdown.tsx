/**
 * WIP
 */
/**
 * May need to just extract out the components to something like this: https://www.radix-ui.com/primitives/docs/components/select#custom-apis
 * as it doesn't allow for objects over strings
 */
// /**
//  * A list of items
//  * The onChange function
//  * The selected item
//  * the ref
//  *
//  * <Select options={['Asia', 'Europe']} value={value} setValue={setValue} placeholder error={"You must select this bitch"} />
//  *
//  * If the options became objects then they would need to follow a similar pattern
//  *
//  * the type of value could be different and then the  item could be a render function
//  *
//  * const Component = () => {
//  *   const possibleValues = [{ name: 'sid', image: '/i.jpg' }]
//  *  const [value, setValue] = useState()
//  *
//  *
//  *  <Select
//  *     options={possibleValues}
//  *     value={value}
//  *     setValue={setValue}
//  *     renderTrigger={(activeItem) => {}}
//  *     renderOption={(option) => {<div> {value.name} / {value.image} </div>}}
//  *
//  *  />
//  *
//  *
//  * }
//  */

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import * as SelectPrimitive from "@radix-ui/react-select";
// import { useRef, FC } from "react";

// interface SelectProps<T = string> {
//   options: T[];
//   value: T | null;
//   setValue: React.Dispatch<React.SetStateAction<T | null>>;
//   placeholder?: string;
//   error?: string;
//   renderTrigger?: T extends string
//     ? ((activeItem: string | null) => JSX.Element) | undefined
//     : (activeItem: T | null) => JSX.Element;
//   renderOption?: T extends string
//     ? ((option: string) => JSX.Element) | undefined
//     : (option: T) => JSX.Element;
// }

// export function Select<T extends {} = string>({
//   options,
//   value,
//   setValue,
//   placeholder = "Select an option",
//   error,
//   renderTrigger,
//   renderOption,
// }: SelectProps<T>) {
//   const selectRef = useRef<HTMLDivElement>(null);

//   return (
//     <SelectPrimitive.Root value={value as any} onValueChange={setValue as any}>
//       <SelectPrimitive.Trigger
//         className="w-full outline-none focus:outline-none"
//         asChild
//       >
//         <div ref={selectRef} tabIndex={-1}>
//           {renderTrigger ? (
//             renderTrigger(value)
//           ) : (
//             <div>{value ?? placeholder}</div>
//           )}
//         </div>
//       </SelectPrimitive.Trigger>

//       <SelectPrimitive.Portal>
//         <SelectPrimitive.Content
//           className="select-content-class"
//           position="popper"
//           sideOffset={8}
//           side="bottom"
//         >
//           <SelectPrimitive.Viewport className="select-viewport-class">
//             {options.map((option, index) => (
//               <SelectPrimitive.Item
//                 value={option as any}
//                 key={index}
//                 className="select-item-class"
//               >
//                 {renderOption ? (
//                   renderOption(option)
//                 ) : (
//                   <div>{(option as any).toString()}</div>
//                 )}
//               </SelectPrimitive.Item>
//             ))}
//           </SelectPrimitive.Viewport>
//         </SelectPrimitive.Content>
//       </SelectPrimitive.Portal>
//     </SelectPrimitive.Root>
//   );
// }
