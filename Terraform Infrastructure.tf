# Terraform Infrastructure (Current State)

# main.tf
provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source = "./modules/vpc"
}

module "efs" {
  source  = "./modules/efs"
  vpc_id  = module.vpc.vpc_id
  subnets = [module.vpc.public_subnet_id, module.vpc.private_subnet_id]
}

module "alb" {
  source  = "./modules/alb"
  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets
}

module "ec2" {
  source                     = "./modules/ec2"
  vpc_id                     = module.vpc.vpc_id
  private_subnet_id          = module.vpc.private_subnet_id
  efs_id                     = module.efs.efs_id
  launch_template_user_data  = filebase64("userdata/app_install.sh")
  alb_target_group_arn       = module.alb.alb_tg_arn
}

# variables.tf
variable "region" { default = "us-east-1" }

# outputs.tf
output "alb_dns" {
  value = module.alb.alb_dns
}


# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = "10.55.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.55.1.0/24"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.55.11.0/24"
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route" "public_inet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

resource "aws_route_table_association" "assoc_public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

output "vpc_id" { value = aws_vpc.main.id }
output "public_subnet_id" { value = aws_subnet.public.id }
output "private_subnet_id" { value = aws_subnet.private.id }
output "public_subnets" { value = [aws_subnet.public.id] }


# modules/efs/main.tf
resource "aws_efs_file_system" "ppt_storage" {
  creation_token   = "ppt-storage"
  encrypted        = true
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"
}

resource "aws_security_group" "efs_sg" {
  name   = "efs-sg"
  vpc_id = var.vpc_id

  ingress {
    protocol  = "tcp"
    from_port = 2049
    to_port   = 2049
    cidr_blocks = ["10.55.0.0/16"]
  }
}

resource "aws_efs_mount_target" "mt_public" {
  file_system_id = aws_efs_file_system.ppt_storage.id
  subnet_id      = var.subnets[0]
  security_groups = [aws_security_group.efs_sg.id]
}

resource "aws_efs_mount_target" "mt_private" {
  file_system_id = aws_efs_file_system.ppt_storage.id
  subnet_id      = var.subnets[1]
  security_groups = [aws_security_group.efs_sg.id]
}

output "efs_id" { value = aws_efs_file_system.ppt_storage.id }


# modules/alb/main.tf
resource "aws_security_group" "alb_sg" {
  name   = "alb-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "app_alb" {
  name               = "littlejapan-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.subnets
}

resource "aws_lb_target_group" "tg" {
  name     = "littlejapan-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

output "alb_dns" { value = aws_lb.app_alb.dns_name }
output "alb_tg_arn" { value = aws_lb_target_group.tg.arn }


# modules/ec2/main.tf
resource "aws_security_group" "ec2_sg" {
  name   = "ec2-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_launch_template" "lt" {
  name_prefix   = "littlejapan-lt"
  image_id      = "ami-0cae6d6fe6048ca2c"
  instance_type = "t3.micro"

  user_data = var.launch_template_user_data

  network_interfaces {
    security_groups = [aws_security_group.ec2_sg.id]
    subnet_id       = var.private_subnet_id
  }
}

resource "aws_autoscaling_group" "asg" {
  desired_capacity     = 1
  max_size             = 2
  min_size             = 1
  vpc_zone_identifier  = [var.private_subnet_id]

  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  target_group_arns = [var.alb_target_group_arn]
}

output "lt_id" { value = aws_launch_template.lt.id }
