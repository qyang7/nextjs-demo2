"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  activeItem, // 当前活动的菜单项
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              className={item.title === activeItem ? "bg-primary  text-white hover:bg-primary-dark" : ""}
            >
              <SidebarMenuButton tooltip={item.title}
                                 className={
                                   item.title === activeItem
                                       ? "hover:bg-primary-dark hover:text-white focus:bg-primary-dark focus:text-white active:bg-primary-dark active:text-white"
                                       : "hover:bg-primary-light hover:text-black focus:bg-primary-light focus:text-black active:bg-primary-light active:text-black"
                                 }>
                  {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}