"use client"

import axiosClient from "./axiosClient"


export interface User {
  id: string
  email: string
  password: string
  sipUser: string
  sipPass: string
  status: 'AVAILABLE' | 'UNAVAILABLE' | string // can adjust to stricter types if needed~
  roles: 'admin' | 'user' | string
  companyId?: string // optional if not always present
  systemCompany: any
  systemCompanyId: number
  createdAt: string | Date
  updatedAt?: string | Date
}


export async function getUsers(): Promise<User[]> {
  const response = await axiosClient.get("/user")
  const users = response.data
  return users;
}

export async function getUserById(id: string): Promise<User | null> {
  const response = await axiosClient.get(`/user/${id}`)
  const user = response.data
  return user
}


// lib/action.ts

export async function createUser(data: {
  email: string
  sipUser: string
  sipPass: string
  password: string
  roles: string
  status: string
  subscriptionId?: string
  systemCompanyId: number
}) {
  const response = await axiosClient.post("/auth/register", data)
  return response.data
}

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const sipUsername = formData.get("sipUsername") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const status = formData.get("status") as string
  const company = formData.get("company") as string

  if (!id || !name || !sipUsername || !phoneNumber || !status || !company) {
    throw new Error("All fields are required")
  }
  const response = await axiosClient.post("/users")
  const user = response.data;
  return user;

}

export async function deleteUser(id: string) {
  const response = await axiosClient.delete(`/user/${id}`)
  const user = response.data;
  return user;
}



