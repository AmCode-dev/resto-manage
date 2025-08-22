import { Empleado } from '@/hooks/use-auth';

const fetchEmpleado = async (userId: string, userEmail?: string) => {
  try {
    console.log('Fetching empleado for user:', userId)

    const { empleado, restaurante, error } = await findEmpleadoByUserId(userId)

    if (error) {
      console.error("Error fetching empleado:", error)
      setEmpleado(null)
      return
    }

    if (empleado) {
      console.log('Found empleado:', empleado.nombre, 'Cargo:', empleado.cargo)
      setEmpleado(empleado)
      return
    }

    // Si no existe empleado asociado, buscar empleados con el mismo email
    if (userEmail) {
      console.log('No empleado found, searching by email:', userEmail)

      const { empleados: existingEmpleados } = await findEmpleadosByEmail(userEmail)

      if (existingEmpleados && existingEmpleados.length > 0) {
        // Si encontramos empleados con el mismo email, asociar con el primero activo
        const activeEmpleado = existingEmpleados.find(emp => emp.estado === 'Activo')
        if (activeEmpleado) {
          console.log('Found existing empleado, associating with user:', activeEmpleado.nombre)

          const { success } = await associateUserWithEmpleado(userId, activeEmpleado.id)
          if (success) {
            // Recargar empleado después de asociar
            await fetchEmpleado(userId, userEmail)
            return
          }
        }
      }

      // Si no encontramos empleados existentes, buscar restaurantes potenciales
      const { restaurantes } = await findPotentialRestaurantsForEmail(userEmail)

      if (restaurantes && restaurantes.length > 0) {
        // Crear empleado automáticamente en el primer restaurante encontrado
        console.log('Creating new empleado for user in restaurant:', restaurantes[0].nombre)

        const { empleado: newEmpleado } = await createEmpleadoForUser({
          nombre: userEmail.split('@')[0], // Usar parte local del email como nombre por defecto
          email: userEmail,
          user_id: userId,
          restaurante_id: restaurantes[0].id
        })

        if (newEmpleado) {
          console.log('Created new empleado:', newEmpleado.nombre)
          setEmpleado(newEmpleado)
          return
        }
      }
    }

    // Si llegamos aquí, no se pudo encontrar o crear un empleado
    console.log("No empleado found and could not create one")
    setEmpleado(null)

  } catch (error) {
    console.error("Error in fetchEmpleado:", error)
    setEmpleado(null)
  }
}

const hasPermission = (permiso: keyof Empleado["permisos"]): boolean => {
  if (!empleado) return false
  return empleado.permisos[permiso] || false
}