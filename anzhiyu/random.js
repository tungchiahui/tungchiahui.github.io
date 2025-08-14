var posts=["2025/08/14/电控视觉环境搭建/","2025/08/08/Linux-STM32-CMake-VScode环境搭建/","2024/08/09/Arm-Keil-MDK6教程/","2023/12/09/ROS2机器人操作系统教程/","2023/03/09/Git教程/","2023/01/19/Docker教学/","2022/01/09/Linux配置教学/","2021/12/19/STM32-RTOS教学/","2021/12/09/C-C-教学/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };